import { describe, expect, it } from "vitest";
import { createRateLimiter, enquirySchema, isLikelyBot } from "@/lib/enquiry";
import { readProspects, prospectSchema, summarise } from "@/lib/backlinks";
import { parsePostSource } from "@/lib/content/posts";
import { pipelineConfigSchema, readPipelineConfig } from "@/lib/pipeline/config";
import { processDraft } from "@/lib/pipeline/draft";
import { markPublished, publishDecision } from "@/lib/pipeline/publish";
import { isoWeek, selectTopics } from "@/lib/pipeline/select";
import { readCalendar, type Topic } from "@/lib/pipeline/topics";
import { getProvider, ManualStepRequired } from "@/lib/providers";
import { baseFrontmatter, ctx, longBody, makeSource } from "./helpers";

const topic = (over: Partial<Topic>): Topic => ({
  id: "T99",
  week: 1,
  slug: "how-to-store-honey",
  workingTitle: "How to store honey at home",
  primaryQuery: "how to store honey",
  secondaryQuestions: [],
  intent: "informational",
  reader: "households",
  cluster: "honey",
  category: "storage-and-kitchen",
  competitors: "unknown",
  evidence: "test",
  originalContribution: "test",
  internalLinks: [],
  cta: "enquiry",
  status: "planned",
  confidence: "medium",
  researchDate: "2026-10-20",
  ...over,
});

describe("topic selection", () => {
  it("skips existing slugs, near-duplicates and blocked topics", () => {
    const topics = [
      topic({ id: "T01", slug: "how-to-store-ghee-at-home", workingTitle: "How to store ghee at home", primaryQuery: "how to store ghee" }),
      topic({ id: "T02", slug: "storing-ghee", workingTitle: "How to store ghee at home", primaryQuery: "how to store ghee at home" }),
      topic({ id: "T03", slug: "blocked-one", workingTitle: "Something blocked here", primaryQuery: "blocked", status: "blocked" }),
      topic({ id: "T04", slug: "how-to-store-honey", week: 2 }),
      topic({ id: "T05", slug: "compost-vs-vermicompost", workingTitle: "Compost or vermicompost", primaryQuery: "compost vs vermicompost", week: 3 }),
    ];
    const existing = [{ slug: "how-to-store-ghee-at-home", title: "How to store ghee at home in Indian weather", targetQuery: "how to store ghee" }];
    const { selected, skipped } = selectTopics(topics, existing, 2);
    expect(selected.map((t) => t.slug)).toEqual(["how-to-store-honey", "compost-vs-vermicompost"]);
    expect(skipped.map((s) => s.topic.slug)).toEqual(["how-to-store-ghee-at-home", "storing-ghee"]);
  });

  it("the real calendar has eight weeks, two slots each, and unique slugs", () => {
    const cal = readCalendar();
    expect(cal.topics.length).toBeGreaterThanOrEqual(16);
    expect(new Set(cal.topics.map((t) => t.slug)).size).toBe(cal.topics.length);
    for (let w = 1; w <= 8; w++) expect(cal.topics.filter((t) => t.week === w).length).toBe(2);
  });

  it("labels ISO weeks", () => {
    expect(isoWeek(new Date("2026-10-20T00:00:00Z"))).toBe("2026-W43");
    expect(isoWeek(new Date("2027-01-01T00:00:00Z"))).toBe("2026-W53");
  });
});

describe("draft processing", () => {
  const draftFile = "/tmp/how-to-store-honey.md";
  it("forces status back to draft and the brief's slug and category", () => {
    const raw = makeSource({ ...baseFrontmatter, status: "published", publishedAt: "2026-10-01", slug: "something-else", category: "buying-guides" }, longBody);
    const out = processDraft("```markdown\n" + raw + "\n```", topic({}), draftFile);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.post.status).toBe("draft");
      expect(out.post.slug).toBe("how-to-store-honey");
      expect(out.post.category).toBe("storage-and-kitchen");
      expect(out.post.publishedAt).toBeUndefined();
      // Sources from a model are never trusted as checked.
      expect(out.post.sources.every((s) => s.verification === "search-summary-only")).toBe(true);
    }
  });
  it("records insufficient evidence as a blocked run", () => {
    const out = processDraft("INSUFFICIENT_EVIDENCE: no official storage guidance found", topic({}), draftFile);
    expect(out).toMatchObject({ ok: false, insufficientEvidence: true });
  });
  it("rejects output without frontmatter", () => {
    expect(processDraft("Just some text", topic({}), draftFile).ok).toBe(false);
  });
});

describe("publishing gates", () => {
  const config = pipelineConfigSchema.parse({});
  const parse = (fm: Record<string, unknown>) => {
    const r = parsePostSource(makeSource({ ...baseFrontmatter, ...fm }, longBody), "/tmp/how-to-store-honey.md");
    if (!r.ok) throw new Error(r.errors.join("; "));
    return r.post;
  };

  it("Mode A publishes only approved, reviewed posts", () => {
    expect(publishDecision(parse({ status: "review" }), ctx(), config, { automatic: false, providerConfigured: false }).allowed).toBe(false);
    expect(publishDecision(parse({ status: "approved" }), ctx(), config, { automatic: false, providerConfigured: false }).allowed).toBe(false);
    expect(publishDecision(parse({ status: "approved", reviewedBy: "Owner" }), ctx(), config, { automatic: false, providerConfigured: false }).allowed).toBe(true);
  });

  it("automatic publishing is refused in review mode and without a provider", () => {
    const post = parse({});
    expect(publishDecision(post, ctx(), config, { automatic: true, providerConfigured: true }).reasons.join()).toMatch(/review/);
    const auto = { ...config, publishMode: "autonomous" as const };
    expect(publishDecision(post, ctx(), auto, { automatic: true, providerConfigured: false }).allowed).toBe(false);
    expect(publishDecision(post, ctx(), auto, { automatic: true, providerConfigured: true }).allowed).toBe(true);
    expect(publishDecision(parse({ healthSensitive: true }), ctx(), auto, { automatic: true, providerConfigured: true }).allowed).toBe(false);
  });

  it("markPublished sets status and dates", () => {
    const out = markPublished(makeSource(baseFrontmatter, longBody), "2026-11-02");
    const r = parsePostSource(out, "/tmp/how-to-store-honey.md");
    expect(r.ok && r.post.status).toBe("published");
    expect(r.ok && r.post.publishedAt).toBe("2026-11-02");
  });

  it("publish mode is configurable by environment", () => {
    expect(readPipelineConfig({}).publishMode).toBe("review");
    expect(readPipelineConfig({ PUBLISH_MODE: "autonomous" }).publishMode).toBe("autonomous");
    expect(() => readPipelineConfig({ PUBLISH_MODE: "yolo" })).toThrow();
  });
});

describe("AI providers", () => {
  it("defaults to manual and never switches on paid usage implicitly", async () => {
    const p = getProvider({ ANTHROPIC_API_KEY: "sk-test" });
    expect(p.name).toBe("manual");
    await expect(p.generate({ system: "", prompt: "" })).rejects.toBeInstanceOf(ManualStepRequired);
  });
  it("reports missing configuration", () => {
    const a = getProvider({ AI_PROVIDER: "anthropic" });
    expect(a.isConfigured()).toBe(false);
    expect(a.missingConfiguration()[0]).toMatch(/ANTHROPIC_API_KEY/);
    expect(getProvider({ AI_PROVIDER: "ollama" }).isConfigured()).toBe(false);
    expect(() => getProvider({ AI_PROVIDER: "other" })).toThrow();
  });
});

describe("enquiries", () => {
  const valid = { name: "Asha", phone: "+91 98765 43210", email: "", product: "ghee", pincode: "560001", message: "2 kg", consent: true, company: "", elapsedMs: 9000 };
  it("validates input", () => {
    expect(enquirySchema.safeParse(valid).success).toBe(true);
    expect(enquirySchema.safeParse({ ...valid, phone: "", email: "" }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, pincode: "12" }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, product: "drugs" }).success).toBe(false);
  });
  it("catches obvious bots", () => {
    expect(isLikelyBot({ company: "x", elapsedMs: 9000, message: "" })).toBe(true);
    expect(isLikelyBot({ company: "", elapsedMs: 300, message: "" })).toBe(true);
    expect(isLikelyBot({ company: "", elapsedMs: 9000, message: "http://a http://b http://c" })).toBe(true);
    expect(isLikelyBot({ company: "", elapsedMs: 9000, message: "2 kg please" })).toBe(false);
  });
  it("rate limits per key", () => {
    const allow = createRateLimiter(2, 1000);
    expect([allow("a", 0), allow("a", 1), allow("a", 2), allow("b", 2), allow("a", 1500)]).toEqual([true, true, false, true, true]);
  });
});

describe("backlink tracking", () => {
  it("the prospects file is valid and contains no guessed contacts", () => {
    const list = readProspects();
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => !p.publicContact || p.contactSource)).toBe(true);
    expect(list.some((p) => p.linkStatus === "live")).toBe(false);
  });
  it("rejects a contact without a public source and a live link without proof", () => {
    const base = readProspects()[0];
    expect(prospectSchema.safeParse({ ...base, publicContact: "a@b.c", contactSource: undefined }).success).toBe(false);
    expect(prospectSchema.safeParse({ ...base, linkStatus: "live" }).success).toBe(false);
  });
  it("summarises earned links and re-checks", () => {
    const s = summarise(readProspects(), "2026-10-01", new Date("2027-03-01T00:00:00Z"));
    expect(s.earned).toEqual([]);
    expect(s.needsRecheck.length).toBe(s.total);
  });
});

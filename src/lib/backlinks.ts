import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

/**
 * Backlink prospects are researched and tracked here; nothing in this module
 * contacts anyone. Outreach is drafted for a person to review and send.
 */
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const prospectSchema = z.object({
  id: z.string().regex(/^BL\d{2,}$/),
  organization: z.string().min(2),
  website: z.url(),
  pageUrl: z.url().optional(),
  type: z.enum([
    "publication",
    "resource-page",
    "community",
    "directory",
    "university-extension",
    "organization",
    "partner",
    "expert-platform",
    "media-library",
  ]),
  topicRelevance: z.enum(["high", "medium", "low"]),
  whySuitable: z.string().min(10),
  editorialLinkPossible: z.enum(["yes", "likely", "unknown", "unlikely", "no"]),
  linkAttribute: z.enum(["follow", "nofollow", "ugc", "sponsored", "unknown"]).default("unknown"),
  guidelines: z.string().optional(),
  guidelinesUrl: z.url().optional(),
  /** Only contacts published by the site for this purpose. Never guessed. */
  publicContact: z.string().optional(),
  contactSource: z.url().optional(),
  checkedOn: isoDate,
  verification: z.enum(["unverified", "search-result-only", "page-checked", "owner-confirmed"]),
  evidence: z.string().min(5),
  suggestedContribution: z.string().min(10),
  outreachStatus: z.enum(["not-started", "drafted", "approved-to-send", "sent", "replied", "declined", "no-reply", "not-pursuing"]),
  outreachDraft: z.string().optional(),
  linkStatus: z.enum(["none", "pending", "live", "removed"]).default("none"),
  linkUrl: z.url().optional(),
  linkVerifiedOn: isoDate.optional(),
  notes: z.string().optional(),
}).superRefine((p, ctx) => {
  if (p.publicContact && !p.contactSource) {
    ctx.addIssue({ code: "custom", path: ["contactSource"], message: "a contact needs the public page it came from" });
  }
  if (p.linkStatus === "live" && (!p.linkUrl || !p.linkVerifiedOn)) {
    ctx.addIssue({ code: "custom", path: ["linkStatus"], message: "a live link needs linkUrl and linkVerifiedOn" });
  }
  if (p.outreachStatus === "sent" && p.verification === "unverified") {
    ctx.addIssue({ code: "custom", path: ["outreachStatus"], message: "verify a prospect before outreach is sent" });
  }
});

export type Prospect = z.infer<typeof prospectSchema>;

export const PROSPECTS_FILE = path.join(process.cwd(), "data", "backlinks", "prospects.json");

export function readProspects(file = PROSPECTS_FILE): Prospect[] {
  const data: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
  const list = z.array(prospectSchema).parse(data);
  const ids = new Set<string>();
  for (const p of list) {
    if (ids.has(p.id)) throw new Error(`Duplicate prospect id ${p.id}`);
    ids.add(p.id);
  }
  return list;
}

export function daysSince(iso: string, now = new Date()): number {
  return Math.floor((now.getTime() - Date.parse(`${iso}T00:00:00Z`)) / 86400000);
}

export type BacklinkSummary = {
  total: number;
  byVerification: Record<string, number>;
  earned: Prospect[];
  needsRecheck: Prospect[];
  followUps: Prospect[];
  readyForOwner: Prospect[];
  newSince: Prospect[];
};

export function summarise(prospects: Prospect[], sinceIso: string, now = new Date()): BacklinkSummary {
  const byVerification: Record<string, number> = {};
  for (const p of prospects) byVerification[p.verification] = (byVerification[p.verification] ?? 0) + 1;
  return {
    total: prospects.length,
    byVerification,
    earned: prospects.filter((p) => p.linkStatus === "live"),
    // Live links are re-checked monthly; prospects every quarter.
    needsRecheck: prospects.filter((p) =>
      p.linkStatus === "live" ? daysSince(p.linkVerifiedOn ?? p.checkedOn, now) > 30 : daysSince(p.checkedOn, now) > 90,
    ),
    followUps: prospects.filter((p) => p.outreachStatus === "sent" || p.outreachStatus === "replied"),
    readyForOwner: prospects.filter((p) => p.outreachStatus === "drafted"),
    newSince: prospects.filter((p) => p.checkedOn >= sinceIso),
  };
}

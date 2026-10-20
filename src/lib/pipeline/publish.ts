import type { Post } from "../content/posts";
import { checkPost, type Issue, type QualityContext } from "../content/quality";
import type { PipelineConfig } from "./config";

export type PublishDecision = { allowed: boolean; reasons: string[]; issues: Issue[] };

/**
 * Decides whether a post may be published.
 *
 * Mode A (review): only posts a person has marked `approved` (with reviewedBy)
 * are published, and only through `npm run content:publish`.
 *
 * Mode B (autonomous): additionally, drafts may be published without a person,
 * but only if an AI provider is configured, all quality gates pass, every source
 * has been opened and checked, there are no unresolved claims, and the article
 * is not health-sensitive.
 */
export function publishDecision(
  post: Post,
  ctx: QualityContext,
  config: PipelineConfig,
  options: { automatic: boolean; providerConfigured: boolean },
): PublishDecision {
  const reasons: string[] = [];
  const issues = checkPost(post, ctx, true);
  const errors = issues.filter((i) => i.severity === "error");
  if (errors.length > 0) reasons.push(`${errors.length} quality gate error(s)`);
  if (post.status === "published") reasons.push("already published");

  if (options.automatic) {
    if (config.publishMode !== "autonomous") reasons.push("publish mode is 'review'; automatic publishing is off");
    if (!options.providerConfigured) reasons.push("no authorised AI provider is configured");
    if (post.healthSensitive && config.requireHumanReviewForHealth) reasons.push("health-sensitive articles always need a person");
    if (post.claims.some((c) => c.sensitive)) reasons.push("sensitive claims always need a person");
  } else {
    if (post.status !== "approved") reasons.push(`status is "${post.status}"; a person must set it to "approved" first`);
    if (!post.reviewedBy) reasons.push("reviewedBy is missing");
  }
  return { allowed: reasons.length === 0, reasons, issues };
}

/** Rewrites frontmatter to published, keeping everything else byte-for-byte. */
export function markPublished(source: string, date: string): string {
  const end = source.indexOf("\n---", 3);
  if (!source.startsWith("---") || end === -1) throw new Error("Missing frontmatter");
  let fm = source.slice(0, end);
  const body = source.slice(end);
  fm = /^status:.*$/m.test(fm) ? fm.replace(/^status:.*$/m, 'status: "published"') : `${fm}\nstatus: "published"`;
  fm = /^publishedAt:.*$/m.test(fm)
    ? fm.replace(/^publishedAt:.*$/m, `publishedAt: "${date}"`)
    : fm.replace(/^(slug:.*)$/m, `$1\npublishedAt: "${date}"`);
  fm = /^updatedAt:.*$/m.test(fm) ? fm.replace(/^updatedAt:.*$/m, `updatedAt: "${date}"`) : `${fm}\nupdatedAt: "${date}"`;
  return fm + body;
}

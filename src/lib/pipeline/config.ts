import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { Env } from "../env";

export const pipelineConfigSchema = z.object({
  publishMode: z.enum(["review", "autonomous"]).default("review"),
  articlesPerWeek: z.number().int().min(0).max(7).default(2),
  maxDraftsPerRun: z.number().int().min(0).max(5).default(2),
  minWords: z.number().int().min(300).default(800),
  requireHumanReviewForHealth: z.boolean().default(true),
  notes: z.string().optional(),
});

export type PipelineConfig = z.infer<typeof pipelineConfigSchema>;

export const PIPELINE_CONFIG_FILE = path.join(process.cwd(), "content", "pipeline.config.json");

/** File settings, overridden by PUBLISH_MODE / ARTICLES_PER_WEEK so mode changes need no code edits. */
export function readPipelineConfig(env: Env = process.env, file = PIPELINE_CONFIG_FILE): PipelineConfig {
  const fromFile: unknown = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
  const config = pipelineConfigSchema.parse(fromFile);
  if (env.PUBLISH_MODE) config.publishMode = z.enum(["review", "autonomous"]).parse(env.PUBLISH_MODE);
  if (env.ARTICLES_PER_WEEK) config.articlesPerWeek = z.coerce.number().int().min(0).max(7).parse(env.ARTICLES_PER_WEEK);
  return config;
}

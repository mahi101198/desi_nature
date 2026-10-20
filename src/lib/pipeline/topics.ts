import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { SLUG_PATTERN } from "../content/schema";

export const TOPIC_STATUSES = ["planned", "researching", "drafted", "review", "published", "blocked", "rejected"] as const;

export const topicSchema = z.object({
  id: z.string().regex(/^T\d{2,}$/),
  week: z.number().int().positive(),
  slug: z.string().regex(SLUG_PATTERN),
  workingTitle: z.string().min(10),
  primaryQuery: z.string().min(3),
  secondaryQuestions: z.array(z.string()).default([]),
  intent: z.enum(["informational", "commercial", "transactional", "navigational"]),
  reader: z.string().min(5),
  cluster: z.string().min(2),
  category: z.string().regex(SLUG_PATTERN),
  competitors: z.string(),
  evidence: z.string(),
  originalContribution: z.string(),
  internalLinks: z.array(z.string()).default([]),
  cta: z.string(),
  status: z.enum(TOPIC_STATUSES),
  blockedReason: z.string().optional(),
  confidence: z.enum(["low", "medium", "high"]),
  researchDate: z.string(),
  risk: z.string().optional(),
  timing: z.string().optional(),
});

export const calendarSchema = z.object({
  researchNote: z.string(),
  startWeek: z.string(),
  slotsPerWeek: z.number().int().positive(),
  topics: z.array(topicSchema),
});

export type Topic = z.infer<typeof topicSchema>;
export type Calendar = z.infer<typeof calendarSchema>;

export const CALENDAR_FILE = path.join(process.cwd(), "content", "topics", "calendar.json");

export function readCalendar(file = CALENDAR_FILE): Calendar {
  const data: unknown = JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ file, "utf8"));
  return calendarSchema.parse(data);
}

export function writeCalendar(calendar: Calendar, file = CALENDAR_FILE): void {
  fs.writeFileSync(file, `${JSON.stringify(calendarSchema.parse(calendar), null, 2)}\n`);
}

/** Topics still to be written, for showing "in preparation" on the site. */
export function upcomingTopics(limit = 6): Topic[] {
  return readCalendar()
    .topics.filter((t) => t.status === "planned" || t.status === "researching" || t.status === "drafted" || t.status === "review")
    .sort((a, b) => a.week - b.week || a.id.localeCompare(b.id))
    .slice(0, limit);
}

import type { MetadataRoute } from "next";
import { getSiteEnv } from "@/lib/env";
import { robotsFor } from "@/lib/robots-rules";

export default function robots(): MetadataRoute.Robots {
  return robotsFor(getSiteEnv());
}

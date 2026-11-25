import type { MetadataRoute } from "next";
import { allowSearchEngines, resolvedSiteUrl } from "@/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!allowSearchEngines) {
    return [];
  }

  return [
    {
      url: `${resolvedSiteUrl}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}

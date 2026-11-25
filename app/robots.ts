import type { MetadataRoute } from "next";
import { allowSearchEngines, resolvedSiteUrl } from "@/site.config";

export default function robots(): MetadataRoute.Robots {
  if (!allowSearchEngines) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${resolvedSiteUrl}/sitemap.xml`,
  };
}

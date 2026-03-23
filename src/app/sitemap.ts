import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://guessme.dhlm-studio.com", lastModified: new Date(), changeFrequency: "daily", priority: 1 }];
}

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://artmatch-gamma.vercel.app", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://artmatch-gamma.vercel.app/calendario", lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: "https://artmatch-gamma.vercel.app/sorprendeme", lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: "https://artmatch-gamma.vercel.app/avis-legal", lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: "https://artmatch-gamma.vercel.app/privacitat", lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: "https://artmatch-gamma.vercel.app/cookies", lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];
}

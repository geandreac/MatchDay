import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://campo-reserva.vercel.app";

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/home`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/termos`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacidade`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];
}

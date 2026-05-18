import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/owner/", "/admin/", "/menu/"] },
    sitemap: "https://campo-reserva.vercel.app/sitemap.xml",
  };
}

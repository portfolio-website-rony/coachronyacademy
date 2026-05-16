import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BASE_URL = "https://coachronyacademy.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticEntries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.7" },
          { path: "/services", changefreq: "monthly", priority: "0.8" },
          { path: "/programs", changefreq: "monthly", priority: "0.8" },
          { path: "/courses", changefreq: "weekly", priority: "0.9" },
          { path: "/shop", changefreq: "weekly", priority: "0.7" },
          { path: "/portfolio", changefreq: "monthly", priority: "0.6" },
          { path: "/events", changefreq: "weekly", priority: "0.7" },
          { path: "/free-class", changefreq: "monthly", priority: "0.7" },
          { path: "/book", changefreq: "monthly", priority: "0.7" },
          { path: "/blog", changefreq: "weekly", priority: "0.8" },
          { path: "/contact", changefreq: "yearly", priority: "0.5" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
        ];

        const [{ data: posts }, { data: courses }] = await Promise.all([
          supabaseAdmin
            .from("cms_blog_posts")
            .select("slug, updated_at, published_at")
            .eq("published", true),
          supabaseAdmin
            .from("courses")
            .select("slug, updated_at")
            .eq("published", true),
        ]);

        const blogEntries: SitemapEntry[] = (posts ?? []).map((p: any) => ({
          path: `/blog/${p.slug}`,
          lastmod: (p.updated_at ?? p.published_at ?? undefined)?.slice(0, 10),
          changefreq: "monthly",
          priority: "0.6",
        }));

        const courseEntries: SitemapEntry[] = (courses ?? []).map((c: any) => ({
          path: `/courses/${c.slug}`,
          lastmod: c.updated_at?.slice(0, 10),
          changefreq: "weekly",
          priority: "0.8",
        }));

        const entries = [...staticEntries, ...blogEntries, ...courseEntries];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

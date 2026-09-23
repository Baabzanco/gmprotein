import { Request, Response } from "express";
import { blogRepository } from "../repositories/blog.repository";

export class SeoController {
  async getSitemap(req: Request, res: Response) {
    try {
      const baseUrl = "https://golmohamadi.com";

      // Fetch all published posts
      const publishedResult = await blogRepository.findAllPublished({ page: 1, limit: 1000 });
      const categories = await blogRepository.findAllCategories();

      const staticUrls = [
        { loc: `${baseUrl}/`, priority: "1.0", changefreq: "weekly" },
        { loc: `${baseUrl}/blog`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/#store-section`, priority: "0.8", changefreq: "weekly" },
        { loc: `${baseUrl}/#about-section`, priority: "0.6", changefreq: "monthly" },
        { loc: `${baseUrl}/#contact-section`, priority: "0.6", changefreq: "monthly" },
      ];

      const postUrls = publishedResult.posts.map((p) => ({
        loc: `${baseUrl}/blog/${p.slug}`,
        lastmod: (p.updatedAt || p.publishedAt || new Date().toISOString()).split("T")[0],
        changefreq: "weekly",
        priority: "0.7",
      }));

      const categoryUrls = categories
        .filter((c) => c.isActive)
        .map((c) => ({
          loc: `${baseUrl}/blog?category=${encodeURIComponent(c.slug)}`,
          lastmod: (c.updatedAt || new Date().toISOString()).split("T")[0],
          changefreq: "weekly",
          priority: "0.5",
        }));

      const allUrls = [...staticUrls, ...postUrls, ...categoryUrls];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      for (const item of allUrls) {
        xml += `  <url>\n`;
        xml += `    <loc>${item.loc}</loc>\n`;
        if ((item as any).lastmod) {
          xml += `    <lastmod>${(item as any).lastmod}</lastmod>\n`;
        }
        xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
        xml += `    <priority>${item.priority}</priority>\n`;
        xml += `  </url>\n`;
      }

      xml += `</urlset>`;

      res.header("Content-Type", "application/xml; charset=utf-8");
      return res.status(200).send(xml);
    } catch (err: any) {
      res.status(500).send("Error generating sitemap");
    }
  }

  async getRobotsTxt(req: Request, res: Response) {
    const robots = `User-agent: *
Allow: /
Allow: /blog
Allow: /blog/
Disallow: /admin
Disallow: /admin/
Disallow: /api/

Sitemap: https://golmohamadi.com/sitemap.xml
`;
    res.header("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(robots);
  }
}

export const seoController = new SeoController();

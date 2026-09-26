import { Request, Response } from "express";
import { blogRepository } from "../repositories/blog.repository";
import { productRepository } from "../repositories/product.repository";
import { categoryRepository } from "../repositories/category.repository";

export class SeoController {
  async getSitemap(req: Request, res: Response) {
    try {
      const baseUrl = "https://golmohamadi.com";

      // Fetch all published posts
      const publishedResult = await blogRepository.findAllPublished({ page: 1, limit: 1000 });
      const blogCategories = await blogRepository.findAllCategories();
      const products = await productRepository.findAll();
      const productCategories = await categoryRepository.findAll();

      const staticUrls = [
        { loc: `${baseUrl}/`, priority: "1.0", changefreq: "weekly" },
        { loc: `${baseUrl}/store`, priority: "0.9", changefreq: "daily" },
        { loc: `${baseUrl}/blog`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/#store-section`, priority: "0.8", changefreq: "weekly" },
        { loc: `${baseUrl}/#about-section`, priority: "0.6", changefreq: "monthly" },
        { loc: `${baseUrl}/#contact-section`, priority: "0.6", changefreq: "monthly" },
      ];

      const productUrls = products
        .filter((p) => p.isAvailable)
        .map((p) => ({
          loc: `${baseUrl}/store/product/${p.slug || p.id}`,
          lastmod: (p.updatedAt || new Date().toISOString()).split("T")[0],
          changefreq: "weekly",
          priority: "0.8",
        }));

      const productCategoryUrls = productCategories
        .filter((c) => c.isActive)
        .map((c) => ({
          loc: `${baseUrl}/store?category=${encodeURIComponent(c.slug || c.id)}`,
          lastmod: (c.updatedAt || new Date().toISOString()).split("T")[0],
          changefreq: "weekly",
          priority: "0.7",
        }));

      const postUrls = publishedResult.posts.map((p) => ({
        loc: `${baseUrl}/blog/${p.slug}`,
        lastmod: (p.updatedAt || p.publishedAt || new Date().toISOString()).split("T")[0],
        changefreq: "weekly",
        priority: "0.7",
      }));

      const blogCategoryUrls = blogCategories
        .filter((c) => c.isActive)
        .map((c) => ({
          loc: `${baseUrl}/blog?category=${encodeURIComponent(c.slug)}`,
          lastmod: (c.updatedAt || new Date().toISOString()).split("T")[0],
          changefreq: "weekly",
          priority: "0.5",
        }));

      const allUrls = [...staticUrls, ...productUrls, ...productCategoryUrls, ...postUrls, ...blogCategoryUrls];

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

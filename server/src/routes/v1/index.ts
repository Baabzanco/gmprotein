import { Router } from "express";
import authRoutes from "./auth.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import contactRoutes from "./contact.routes";
import landingRoutes from "./landing.routes";
import adminRoutes from "./admin.routes";
import campaignRoutes from "./campaign.routes";
import blogRoutes from "./blog.routes";
import mediaRoutes from "./media.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/contact-requests", contactRoutes);
router.use("/landing", landingRoutes);
router.use("/admin", adminRoutes);
router.use("/admin/media", mediaRoutes);
router.use("/media", mediaRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/blog", blogRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: "v1",
    timestamp: new Date().toISOString(),
  });
});

export default router;

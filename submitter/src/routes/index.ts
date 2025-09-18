import { Router } from "express";
import healthRoutes from "./health.routes";
import jobRoutes from "./job.routes";

const router = Router();

// Mount routes
router.use("/api/jobs", jobRoutes);
router.use("/", healthRoutes);

export default router;

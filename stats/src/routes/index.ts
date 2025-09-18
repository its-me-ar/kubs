import { Router } from "express";
import healthRoutes from "./health.routes";
import statsRoutes from "./stats.routes";

const router = Router();

// Mount routes
router.use("/", healthRoutes);
router.use("/", statsRoutes);

export default router;

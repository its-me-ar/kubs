import { Router } from "express";
import { StatsController } from "../controllers/stats.controller";

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get stats service information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Stats service information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service:
 *                   type: string
 *                   example: "Stats Service"
 *                 message:
 *                   type: string
 *                   example: "Hello from Service : Stats 📊"
 *                 description:
 *                   type: string
 *                   example: "Aggregates statistics from submitter and workers services"
 *                 status:
 *                   type: string
 *                   example: "active"
 */
router.get("/", StatsController.root);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Stats service health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Stats service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 service:
 *                   type: string
 *                   example: "Stats Service"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Service uptime in seconds
 *                 description:
 *                   type: string
 *                   example: "Aggregates statistics from submitter and workers services"
 *                 dependencies:
 *                   type: object
 *                   properties:
 *                     submitter:
 *                       type: object
 *                     workers:
 *                       type: object
 *                     redis:
 *                       type: object
 */
router.get("/health", StatsController.healthCheck);

/**
 * @swagger
 * /docs:
 *   get:
 *     summary: API Documentation
 *     tags: [Health]
 *     responses:
 *       302:
 *         description: Redirect to Swagger UI
 */
router.get("/docs", (req, res) => {
  res.redirect('/api-docs');
});

export default router;

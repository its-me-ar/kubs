import { Router } from "express";
import { HealthController } from "../controllers/health.controller";

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get service information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service information retrieved successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Hello from Service : Job Submitter 🚀"
 */
router.get("/", HealthController.root);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
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
 *                   example: "Job Submitter"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Service uptime in seconds
 */
router.get("/health", HealthController.healthCheck);

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

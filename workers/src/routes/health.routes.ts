import { Router } from "express";
import { HealthController } from "../controllers/health.controller";

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get worker service information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Worker service information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service:
 *                   type: string
 *                   example: "Worker Service"
 *                 message:
 *                   type: string
 *                   example: "Hello from Service : Worker ⚙️"
 *                 description:
 *                   type: string
 *                   example: "Processes CPU-intensive jobs from Redis queue"
 *                 status:
 *                   type: string
 *                   example: "active"
 */
router.get("/", HealthController.root);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Worker health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Worker service is healthy
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
 *                   example: "Worker Service"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Service uptime in seconds
 *                 description:
 *                   type: string
 *                   example: "Processes CPU-intensive jobs from Redis queue"
 */
router.get("/health", HealthController.healthCheck);

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Prometheus metrics endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Prometheus metrics in text format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               description: Prometheus metrics in text format
 */
router.get("/metrics", HealthController.metrics);

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

import { Router } from "express";
import { StatsController } from "../controllers/stats.controller";

const router = Router();

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Get aggregated statistics from all services
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 jobStats:
 *                   type: object
 *                   properties:
 *                     totalJobsSubmitted:
 *                       type: number
 *                     totalJobsCompleted:
 *                       type: number
 *                     totalJobsFailed:
 *                       type: number
 *                     totalJobsProcessing:
 *                       type: number
 *                     totalJobsQueued:
 *                       type: number
 *                     averageProcessingTime:
 *                       type: number
 *                     queueLength:
 *                       type: number
 *                 serviceStats:
 *                   type: object
 *                   properties:
 *                     submitter:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         uptime:
 *                           type: number
 *                     workers:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         uptime:
 *                           type: number
 *                         jobsProcessed:
 *                           type: number
 *                         jobErrors:
 *                           type: number
 *                     redis:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         connected:
 *                           type: boolean
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/stats", StatsController.getStats);

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Prometheus metrics endpoint
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Prometheus metrics in text format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               description: Prometheus metrics in text format
 */
router.get("/metrics", StatsController.getMetrics);

export default router;

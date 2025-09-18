import { Request, Response } from "express";
import statsService from "../services/stats.service";
import metricsService from "../services/metrics.service";
import logger from "../config/logger";
import { StatsResponse } from "../types";

export class StatsController {
  /**
   * Get aggregated stats from all services
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const [jobStats, serviceStats] = await Promise.all([
        statsService.getJobStats(),
        statsService.getServiceStats()
      ]);

      // Update Prometheus metrics
      metricsService.updateJobStats(jobStats);

      const response: StatsResponse = {
        timestamp: new Date().toISOString(),
        jobStats,
        serviceStats
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error getting stats:", error);
      res.status(500).json({ error: "Failed to get stats" });
    }
  }

  /**
   * Get Prometheus metrics
   */
  static async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).set("Content-Type", metricsService.getContentType());
      const metrics = await metricsService.getMetrics();
      res.end(metrics);
    } catch (error) {
      logger.error("Error getting metrics:", error);
      res.status(500).json({ error: "Failed to get metrics" });
    }
  }

  /**
   * Root endpoint
   */
  static async root(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      service: "Stats Service",
      message: "Hello from Service : Stats 📊",
      description: "Aggregates statistics from submitter and workers services",
      status: "active"
    });
  }

  /**
   * Health check endpoint
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const serviceStats = await statsService.getServiceStats();
      
      const isHealthy = serviceStats.redis.connected && 
                       serviceStats.submitter.status === "healthy" && 
                       serviceStats.workers.status === "healthy";

      const response = {
        status: isHealthy ? "healthy" : "degraded",
        service: "Stats Service",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        description: "Aggregates statistics from submitter and workers services",
        dependencies: serviceStats
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error in health check:", error);
      res.status(500).json({ 
        status: "unhealthy", 
        service: "Stats Service",
        error: "Health check failed" 
      });
    }
  }
}

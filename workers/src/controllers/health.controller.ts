import { Request, Response } from "express";
import metricsService from "../services/metrics.service";

export class HealthController {
  /**
   * Health check endpoint
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    const response = {
      status: "healthy",
      service: "Worker Service",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      description: "Processes CPU-intensive jobs from Redis queue"
    };

    res.status(200).json(response);
  }

  /**
   * Root endpoint
   */
  static async root(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      service: "Worker Service",
      message: "Hello from Service : Worker ⚙️",
      description: "Processes CPU-intensive jobs from Redis queue",
      status: "active"
    });
  }

  /**
   * Metrics endpoint for Prometheus
   */
  static async metrics(req: Request, res: Response): Promise<void> {
    res.status(200).set("Content-Type", metricsService.getContentType());
    const metrics = await metricsService.getMetrics();
    res.end(metrics);
  }
}

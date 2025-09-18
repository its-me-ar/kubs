import { Request, Response } from "express";

export class HealthController {
  /**
   * Health check endpoint
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: "healthy",
      service: "Job Submitter",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }

  /**
   * Root endpoint
   */
  static async root(_req: Request, res: Response): Promise<void> {
    res.status(200).send("Hello from Service : Job Submitter 🚀");
  }
}

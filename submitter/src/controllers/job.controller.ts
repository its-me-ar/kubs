import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import redisService from "../services/redis.service";
import { SubmitJobResponse, JobStatusResponse } from "../types";
import logger from "../config/logger";

export class JobController {
  /**
   * Submit a new job (API Gateway - only adds jobs, doesn't process them)
   */
  static async submitJob(req: Request, res: Response): Promise<void> {
    try {
      const jobId = uuidv4();
      const { type, payload } = req.body;

      // Validate job type
      const validTypes = ['prime', 'bcrypt', 'sort'];
      if (!type || !validTypes.includes(type)) {
        res.status(400).json({ 
          error: "Invalid job type. Must be one of: prime, bcrypt, sort" 
        });
        return;
      }

      // Save job status in Redis
      await redisService.saveJob(jobId, {
        status: "queued",
        type,
        payload: JSON.stringify(payload || {}),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

          // Add job to BullMQ queue for worker processing
          await redisService.addJobToQueue(jobId, { type, payload: payload || {} });

      const response: SubmitJobResponse = { jobId, status: "queued" };
      res.status(201).json(response);
        } catch (err) {
          logger.error("Error submitting job:", err);
          res.status(500).json({ error: "Failed to submit job" });
        }
  }

  /**
   * Get job status
   */
  static async getJobStatus(req: Request, res: Response): Promise<void> {
    const jobId = req.params.jobId;

    try {
      const job = await redisService.getJob(jobId);
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }


      const response: JobStatusResponse = {
        ...job,
      };
      res.json(response);
        } catch (err) {
          logger.error("Error fetching job status:", err);
          res.status(500).json({ error: "Failed to fetch job status" });
        }
  }

}

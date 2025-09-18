import { Queue, Worker, Job } from "bullmq";
import { connection } from "../config/redis";
import redis from "../config/redis";
import metricsService from "./metrics.service";
import { JobProcessors } from "../utils/job-processors";
import { JobData } from "../types";
import logger from "../config/logger";


class QueueService {
  private jobQueue: Queue;
  private worker: Worker;
  private redis = redis;

  constructor() {
    this.jobQueue = new Queue("jobs", { connection });
    this.worker = new Worker(
      "jobs",
      async (job: Job<JobData & { jobId: string }>) => {
        const start = Date.now();
        const jobId = job.data.jobId;
        
        try {
          // Update job status to processing
          await this.updateJobStatus(jobId, "processing");
          
          const result = await JobProcessors.processJob(job.data);
          
          if (result.success) {
            // Update job status to completed with result
            await this.updateJobStatus(jobId, "completed", { 
              result: JSON.stringify(result.result),
              updatedAt: new Date().toISOString()
            });
            metricsService.incrementJobsProcessed();
          } else {
            // Update job status to failed with error
            await this.updateJobStatus(jobId, "failed", { 
              error: result.error,
              updatedAt: new Date().toISOString()
            });
            metricsService.incrementJobErrors();
            throw new Error(result.error);
          }
        } catch (err) {
          console.error("Job failed:", err);
          // Update job status to failed with error
          await this.updateJobStatus(jobId, "failed", { 
            error: err instanceof Error ? err.message : "Unknown error",
            updatedAt: new Date().toISOString()
          });
          metricsService.incrementJobErrors();
          throw err;
        } finally {
          const duration = (Date.now() - start) / 1000;
          metricsService.observeProcessingTime(duration);
        }
      },
      { connection }
    );

    this.setupEventListeners();
  }

  private async updateJobStatus(jobId: string, status: string, additionalData?: any): Promise<void> {
    try {
      const updateData: any = { status, updatedAt: new Date().toISOString() };
      if (additionalData) {
        Object.assign(updateData, additionalData);
      }
      await this.redis.hSet(`job:${jobId}`, updateData);
        } catch (err) {
          logger.error("Failed to update job status:", err);
        }
  }

  private setupEventListeners(): void {
    this.worker.on("completed", (job: Job) => {
      logger.info(`Job ${job.id} completed successfully`);
    });

    this.worker.on("failed", (job: Job | undefined, err: Error) => {
      logger.error(`Job ${job?.id} failed:`, err);
    });

    this.worker.on("error", (err: Error) => {
      logger.error("Worker error:", err);
    });
  }

  // Workers don't add jobs, they only process them
  // Jobs are added by the submitter service

  async close(): Promise<void> {
    logger.info("Closing queue service...");
    await this.worker.close();
    await this.jobQueue.close();
    logger.info("Queue service closed");
  }
}

export default new QueueService();

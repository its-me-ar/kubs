import { Queue } from "bullmq";
import { connection } from "../config/redis";
import redis from "../config/redis";
import { Job } from "../types";
import logger from "../config/logger";

class RedisService {
  private redis = redis;
  private jobQueue: Queue;

  constructor() {
    this.jobQueue = new Queue("jobs", { connection });
  }

  async saveJob(jobId: string, jobData: Partial<Job>): Promise<void> {
    await this.redis.hSet(`job:${jobId}`, jobData);
  }

  async getJob(jobId: string): Promise<Job | null> {
    const job = await this.redis.hGetAll(`job:${jobId}`);
    if (!job || Object.keys(job).length === 0) {
      return null;
    }
    
    // Parse JSON fields if they exist
    const result = { 
      jobId, 
      ...job,
      payload: job.payload ? JSON.parse(job.payload) : undefined,
      result: job.result ? JSON.parse(job.result) : undefined
    } as Job;
    
    return result;
  }

  async addJobToQueue(jobId: string, jobData: any): Promise<void> {
    await this.jobQueue.add("process-job", { jobId, ...jobData }, {
      jobId: jobId,
      removeOnComplete: 10,
      removeOnFail: 5
    });
  }

  async updateJobStatus(jobId: string, status: string, additionalData?: any): Promise<void> {
    const updateData: any = { status, updatedAt: new Date().toISOString() };
    if (additionalData) {
      Object.assign(updateData, additionalData);
    }
    await this.redis.hSet(`job:${jobId}`, updateData);
  }

  async getQueueStats(): Promise<any> {
    const waiting = await this.jobQueue.getWaiting();
    const active = await this.jobQueue.getActive();
    const completed = await this.jobQueue.getCompleted();
    const failed = await this.jobQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  async close(): Promise<void> {
    logger.info("Closing Redis service...");
    await this.jobQueue.close();
    await this.redis.quit();
    logger.info("Redis service closed");
  }
}

export default new RedisService();

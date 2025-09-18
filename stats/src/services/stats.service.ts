import redis from "../config/redis";
import logger from "../config/logger";
import { JobStats, ServiceStats } from "../types";

class StatsService {
  private redis = redis;

  async getJobStats(): Promise<JobStats> {
    try {
      // Get all job keys from Redis
      const jobKeys = await this.redis.keys("job:*");
      
      let totalJobsSubmitted = 0;
      let totalJobsCompleted = 0;
      let totalJobsFailed = 0;
      let totalJobsProcessing = 0;
      let totalJobsQueued = 0;
      let totalProcessingTime = 0;
      let completedJobsCount = 0;

      // Process each job to get statistics
      for (const key of jobKeys) {
        const jobData = await this.redis.hGetAll(key);
        if (jobData && Object.keys(jobData).length > 0) {
          totalJobsSubmitted++;
          
          const status = jobData.status;
          switch (status) {
            case 'completed':
              totalJobsCompleted++;
              if (jobData.result) {
                try {
                  const result = JSON.parse(jobData.result);
                  if (result.processingTime) {
                    totalProcessingTime += result.processingTime;
                    completedJobsCount++;
                  }
                } catch (e) {
                  logger.warn(`Failed to parse result for job ${key}:`, e);
                }
              }
              break;
            case 'failed':
              totalJobsFailed++;
              break;
            case 'processing':
              totalJobsProcessing++;
              break;
            case 'queued':
              totalJobsQueued++;
              break;
          }
        }
      }

      // Get queue length from BullMQ
      const queueLength = await this.getQueueLength();

      const averageProcessingTime = completedJobsCount > 0 
        ? totalProcessingTime / completedJobsCount 
        : 0;

      return {
        totalJobsSubmitted,
        totalJobsCompleted,
        totalJobsFailed,
        totalJobsProcessing,
        totalJobsQueued,
        averageProcessingTime,
        queueLength
      };
    } catch (error) {
      logger.error("Error getting job stats:", error);
      return {
        totalJobsSubmitted: 0,
        totalJobsCompleted: 0,
        totalJobsFailed: 0,
        totalJobsProcessing: 0,
        totalJobsQueued: 0,
        averageProcessingTime: 0,
        queueLength: 0
      };
    }
  }

  private async getQueueLength(): Promise<number> {
    try {
      // Get queue length from BullMQ
      const queueKeys = await this.redis.keys("bull:jobs:*");
      let queueLength = 0;
      
      for (const key of queueKeys) {
        if (key.includes(":waiting") || key.includes(":active")) {
          const length = await this.redis.lLen(key);
          queueLength += length;
        }
      }
      
      return queueLength;
    } catch (error) {
      logger.error("Error getting queue length:", error);
      return 0;
    }
  }

  async getServiceStats(): Promise<ServiceStats> {
    try {
      // Check submitter service
      const submitterStatus = await this.checkServiceHealth("http://localhost:3000/health");
      
      // Check workers service
      const workersStatus = await this.checkServiceHealth("http://localhost:3001/health");
      
      // Check Redis connection
      const redisStatus = await this.checkRedisHealth();

      return {
        submitter: {
          status: submitterStatus.status,
          uptime: submitterStatus.uptime || 0
        },
        workers: {
          status: workersStatus.status,
          uptime: workersStatus.uptime || 0,
          jobsProcessed: workersStatus.jobsProcessed || 0,
          jobErrors: workersStatus.jobErrors || 0
        },
        redis: {
          status: redisStatus ? "connected" : "disconnected",
          connected: redisStatus
        }
      };
    } catch (error) {
      logger.error("Error getting service stats:", error);
      return {
        submitter: { status: "unknown", uptime: 0 },
        workers: { status: "unknown", uptime: 0, jobsProcessed: 0, jobErrors: 0 },
        redis: { status: "unknown", connected: false }
      };
    }
  }

  private async checkServiceHealth(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
      return { status: "unhealthy", uptime: 0 };
    } catch (error) {
      logger.warn(`Failed to check service health at ${url}:`, error);
      return { status: "unreachable", uptime: 0 };
    }
  }

  private async checkRedisHealth(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      logger.warn("Redis health check failed:", error);
      return false;
    }
  }
}

export default new StatsService();

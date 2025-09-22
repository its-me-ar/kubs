import client from "prom-client";

class MetricsService {
  private register: client.Registry;
  private totalJobsSubmitted: client.Gauge;
  private totalJobsCompleted: client.Gauge;
  private totalJobsFailed: client.Gauge;
  private queueLength: client.Gauge;
  private averageProcessingTime: client.Gauge;

  constructor() {
    this.register = new client.Registry();
    client.collectDefaultMetrics({ register: this.register });

    this.totalJobsSubmitted = new client.Gauge({
      name: "total_jobs_submitted",
      help: "Total number of jobs submitted to the system",
    });

    this.totalJobsCompleted = new client.Gauge({
      name: "total_jobs_completed",
      help: "Total number of jobs completed successfully",
    });

    this.totalJobsFailed = new client.Gauge({
      name: "total_jobs_failed",
      help: "Total number of jobs that failed",
    });

    this.queueLength = new client.Gauge({
      name: "queue_length",
      help: "Current length of the job queue",
    });

    this.averageProcessingTime = new client.Gauge({
      name: "average_processing_time_seconds",
      help: "Average processing time for jobs in seconds",
    });

    this.register.registerMetric(this.totalJobsSubmitted);
    this.register.registerMetric(this.totalJobsCompleted);
    this.register.registerMetric(this.totalJobsFailed);
    this.register.registerMetric(this.queueLength);
    this.register.registerMetric(this.averageProcessingTime);
  }

  updateJobStats(stats: {
    totalJobsSubmitted: number;
    totalJobsCompleted: number;
    totalJobsFailed: number;
    queueLength: number;
    averageProcessingTime: number;
  }): void {
    // Set gauge values directly (no reset needed for gauges)
    this.totalJobsSubmitted.set(stats.totalJobsSubmitted);
    this.totalJobsCompleted.set(stats.totalJobsCompleted);
    this.totalJobsFailed.set(stats.totalJobsFailed);
    this.queueLength.set(stats.queueLength);
    this.averageProcessingTime.set(stats.averageProcessingTime);
  }

  getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  getContentType(): string {
    return this.register.contentType;
  }
}

export default new MetricsService();

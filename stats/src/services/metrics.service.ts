import client from "prom-client";

class MetricsService {
  private register: client.Registry;
  private totalJobsSubmitted: client.Counter;
  private totalJobsCompleted: client.Counter;
  private totalJobsFailed: client.Counter;
  private queueLength: client.Gauge;
  private averageProcessingTime: client.Gauge;

  constructor() {
    this.register = new client.Registry();
    client.collectDefaultMetrics({ register: this.register });

    this.totalJobsSubmitted = new client.Counter({
      name: "total_jobs_submitted",
      help: "Total number of jobs submitted to the system",
    });

    this.totalJobsCompleted = new client.Counter({
      name: "total_jobs_completed",
      help: "Total number of jobs completed successfully",
    });

    this.totalJobsFailed = new client.Counter({
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
    // Reset counters to current values
    this.totalJobsSubmitted.reset();
    this.totalJobsCompleted.reset();
    this.totalJobsFailed.reset();
    
    // Set the new values
    this.totalJobsSubmitted.inc(stats.totalJobsSubmitted);
    this.totalJobsCompleted.inc(stats.totalJobsCompleted);
    this.totalJobsFailed.inc(stats.totalJobsFailed);
    
    // Gauges can be set directly
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

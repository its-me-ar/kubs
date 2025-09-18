import client from "prom-client";

class MetricsService {
  private register: client.Registry;
  private jobsProcessed: client.Counter;
  private jobErrors: client.Counter;
  private jobProcessingTime: client.Histogram;

  constructor() {
    this.register = new client.Registry();
    client.collectDefaultMetrics({ register: this.register });

    this.jobsProcessed = new client.Counter({
      name: "jobs_processed_total",
      help: "Total number of jobs processed by the worker",
    });

    this.jobErrors = new client.Counter({
      name: "job_errors_total",
      help: "Total number of job errors",
    });

    this.jobProcessingTime = new client.Histogram({
      name: "job_processing_time_seconds",
      help: "Time taken to process jobs",
      buckets: [0.1, 0.5, 1, 2, 5, 10],
    });

    this.register.registerMetric(this.jobsProcessed);
    this.register.registerMetric(this.jobErrors);
    this.register.registerMetric(this.jobProcessingTime);
  }

  incrementJobsProcessed(): void {
    this.jobsProcessed.inc();
  }

  incrementJobErrors(): void {
    this.jobErrors.inc();
  }

  observeProcessingTime(duration: number): void {
    this.jobProcessingTime.observe(duration);
  }

  async getMetrics(): Promise<string> {
    return await this.register.metrics();
  }

  getContentType(): string {
    return this.register.contentType;
  }
}

export default new MetricsService();

export interface JobData {
  type: 'prime' | 'bcrypt' | 'sort';
  payload?: any;
}

export interface JobResult {
  success: boolean;
  result?: any;
  error?: string;
  processingTime: number;
}

export interface WorkerMetrics {
  jobsProcessed: number;
  jobErrors: number;
  averageProcessingTime: number;
  uptime: number;
}

export interface HealthStatus {
  status: string;
  service: string;
  timestamp: string;
  uptime: number;
  metrics: WorkerMetrics;
}

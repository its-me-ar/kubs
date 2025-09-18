export interface JobStats {
  totalJobsSubmitted: number;
  totalJobsCompleted: number;
  totalJobsFailed: number;
  totalJobsProcessing: number;
  totalJobsQueued: number;
  averageProcessingTime: number;
  queueLength: number;
}

export interface ServiceStats {
  submitter: {
    status: string;
    uptime: number;
  };
  workers: {
    status: string;
    uptime: number;
    jobsProcessed: number;
    jobErrors: number;
  };
  redis: {
    status: string;
    connected: boolean;
  };
}

export interface StatsResponse {
  timestamp: string;
  jobStats: JobStats;
  serviceStats: ServiceStats;
}

export interface Job {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  type: 'prime' | 'bcrypt' | 'sort';
  payload?: any;
  createdAt?: string;
  updatedAt?: string;
  result?: any;
  error?: string;
}

export interface SubmitJobRequest {
  type: 'prime' | 'bcrypt' | 'sort';
  payload?: any;
}

export interface SubmitJobResponse {
  jobId: string;
  status: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: string;
  [key: string]: any;
}

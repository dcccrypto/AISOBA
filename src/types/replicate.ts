export interface ReplicatePrediction {
  id: string;
  version: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  input: {
    prompt: string;
    [key: string]: any;
  };
  output: string[] | null;
  error: string | null;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface ReplicateError {
  detail?: string;
  message?: string;
} 
import { Prediction as ReplicateBasePrediction } from 'replicate';

export interface ReplicatePrediction extends ReplicateBasePrediction {
  output?: string[];
  error?: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
}

export interface ReplicateError {
  detail?: string;
  message?: string;
  error?: string;
} 
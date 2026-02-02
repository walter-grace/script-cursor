import { toast } from 'sonner';

export interface RateLimitError {
  message: string;
  retryAfter?: number;
}

export function handleRateLimitError(error: unknown): RateLimitError | null {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String(error.message).toLowerCase();
    
    if (message.includes('rate limit') || message.includes('429')) {
      const retryAfter = extractRetryAfter(error);
      toast.error('Rate limit exceeded. Please try again later.', {
        description: retryAfter ? `Retry after ${retryAfter} seconds` : undefined,
      });
      return {
        message: 'Rate limit exceeded',
        retryAfter,
      };
    }
  }
  
  return null;
}

function extractRetryAfter(error: unknown): number | undefined {
  if (error && typeof error === 'object') {
    if ('retryAfter' in error && typeof error.retryAfter === 'number') {
      return error.retryAfter;
    }
    if ('headers' in error && error.headers && typeof error.headers === 'object') {
      const retryAfter = (error.headers as Record<string, string>)['retry-after'];
      if (retryAfter) {
        return parseInt(retryAfter, 10);
      }
    }
  }
  return undefined;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const rateLimitError = handleRateLimitError(error);
      
      if (rateLimitError && attempt < maxRetries - 1) {
        const delay = rateLimitError.retryAfter
          ? rateLimitError.retryAfter * 1000
          : initialDelay * Math.pow(2, attempt);
        
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}


import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return (
      !error.response ||
      error.response.status >= 500 ||
      error.response.status === 429
    );
  },
};

export const createRetryInterceptor = (config: Partial<RetryConfig> = {}) => {
  const retryConfig = { ...defaultRetryConfig, ...config };

  return (axiosInstance: AxiosInstance) => {
    axiosInstance.interceptors.response.use(
      // Success response - pass through
      (response) => response,

      // Error response - apply retry logic
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retryCount?: number;
        };

        // Initialize retry count
        if (!originalRequest._retryCount) {
          originalRequest._retryCount = 0;
        }

        // Check if we should retry
        const shouldRetry =
          originalRequest._retryCount < retryConfig.maxRetries &&
          retryConfig.retryCondition!(error);

        if (!shouldRetry) {
          return Promise.reject(error);
        }

        // Increment retry count
        originalRequest._retryCount++;

        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(2, originalRequest._retryCount - 1),
          retryConfig.maxDelay
        );

        console.log(
          `Retrying request (attempt ${originalRequest._retryCount}/${retryConfig.maxRetries}) after ${delay}ms delay`
        );

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Retry the request
        return axiosInstance(originalRequest);
      }
    );
  };
};

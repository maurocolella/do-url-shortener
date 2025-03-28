/**
 * Interface for API error responses
 */
export interface IApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

/**
 * Type for handling axios error responses
 */
export interface IAxiosErrorResponse {
  response?: {
    data?: IApiError;
    status?: number;
  };
  message?: string;
}

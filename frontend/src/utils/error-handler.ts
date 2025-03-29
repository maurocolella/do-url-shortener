import { toast } from 'react-toastify';

/**
 * Handle URL shortening error responses and display appropriate toast messages
 * @param error - The error object from the API request
 */
export const handleUrlShorteningError = (error: unknown): void => {
  // Extract more specific error messages
  let errorMessage = 'Failed to shorten URL';
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  // Provide more specific messages for common errors
  if (errorMessage.includes('already in use')) {
    toast.error('This custom slug is already taken. Please try a different one.');
  // This should be unreachable due to deduplication logic
  // } else if (errorMessage.includes('already exists')) {
  //  toast.error('This URL has already been shortened. You can find it in your dashboard.');
  } else if (errorMessage.includes('logged in') || errorMessage.includes('Unauthorized')) {
    toast.error('You must be logged in to use custom slugs.');
  } else {
    toast.error(errorMessage);
  }
};

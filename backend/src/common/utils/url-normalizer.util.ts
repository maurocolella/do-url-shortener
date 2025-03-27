/**
 * URL Normalization Utility
 * Provides functions to normalize and canonicalize URLs
 */
export class UrlNormalizer {
  /**
   * Normalizes a URL to a canonical form
   * - Adds https:// if no scheme is provided
   * - Converts scheme and host to lowercase
   * - Handles trailing slashes consistently
   * - Sorts query parameters in a consistent order
   * 
   * @param url - The URL to normalize
   * @returns The normalized URL string
   */
  public static normalize(url: string): string {
    try {
      // Add https:// if no scheme is provided
      if (!url.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//)) {
        url = `https://${url}`;
      }

      // Parse the URL
      const parsedUrl = new URL(url);
      
      // Convert scheme and host to lowercase
      parsedUrl.protocol = parsedUrl.protocol.toLowerCase();
      parsedUrl.host = parsedUrl.host.toLowerCase();
      
      // Sort query parameters
      if (parsedUrl.search) {
        const searchParams = new URLSearchParams(parsedUrl.search);
        const sortedParams = new URLSearchParams();
        
        // Get all parameter names and sort them
        const paramNames = Array.from(searchParams.keys()).sort();
        
        // Add parameters in sorted order
        for (const name of paramNames) {
          const values = searchParams.getAll(name).sort();
          for (const value of values) {
            sortedParams.append(name, value);
          }
        }
        
        // Replace search with sorted parameters
        parsedUrl.search = sortedParams.toString() ? `?${sortedParams.toString()}` : '';
      }
      
      // Handle trailing slashes consistently (we'll keep them for paths)
      if (parsedUrl.pathname === '/') {
        parsedUrl.pathname = '';
      }
      
      // Return the normalized URL
      return parsedUrl.toString();
    } catch (error) {
      // If URL parsing fails, return the original URL
      console.error('Error normalizing URL:', error);
      return url;
    }
  }
  
  /**
   * Generates a hash for a URL and user ID combination
   * This ensures that the same URL will produce different hashes for different users
   * 
   * @param url - The normalized URL
   * @param userId - The user ID
   * @returns A hash string that can be used for generating a unique alias
   */
  public static generateNamespacedHash(url: string, userId: string): string {
    // Create a combined string of URL and user ID
    const combined = `${url}:${userId}`;
    
    // Convert to a numeric hash (simple implementation)
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Make sure the hash is positive
    return Math.abs(hash).toString();
  }
}

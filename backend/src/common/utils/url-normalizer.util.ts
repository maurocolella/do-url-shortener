/**
 * URL Normalization Utility
 * Provides functions to normalize and canonicalize URLs
 * 
 * NOTE: This implementation should match the frontend URL normalizer in
 * frontend/src/utils/url-normalizer.ts as closely as possible.
 */
export class UrlNormalizer {
  /**
   * Normalizes a URL by:
   * 1. Adding https:// if protocol is missing (but preserves http:// if specified)
   * 2. Converting hostname to lowercase
   * 3. Sorting query parameters
   * 4. Removing trailing slashes from non-root paths
   * 5. Adding trailing slashes to root paths
   * 6. Preserving fragments (hash)
   * 
   * @param url - URL to normalize
   * @returns Normalized URL
   */
  public static normalize(url: string): string {
    try {
      // If URL is empty, null, or undefined, return empty string
      if (!url) {
        return '';
      }
      
      // Check if URL is valid before attempting to add protocol
      // This avoids treating strings like "not a url" as valid URLs
      if (!this.isValidUrl(url)) {
        return url;
      }
      
      // Add protocol if missing (default to https)
      let normalizedUrl = url;
      if (!normalizedUrl.toLowerCase().startsWith('http://') && !normalizedUrl.toLowerCase().startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      
      // Parse the URL
      const parsedUrl = new URL(normalizedUrl);
      
      // Convert hostname to lowercase
      parsedUrl.hostname = parsedUrl.hostname.toLowerCase();
      
      // Convert protocol to lowercase
      parsedUrl.protocol = parsedUrl.protocol.toLowerCase();
      
      // Handle trailing slashes
      let path = parsedUrl.pathname;
      if (path.length > 1) {
        // Remove trailing slashes for non-root paths
        while (path.endsWith('/')) {
          path = path.slice(0, -1);
        }
      } else if (path === '') {
        // Add trailing slash for root domain with no path
        path = '/';
      }
      
      // Handle multiple leading slashes in the path
      path = path.replace(/\/+/g, '/');
      
      // Extract and sort query parameters
      const searchParams = new URLSearchParams(parsedUrl.search);
      const paramEntries = Array.from(searchParams.entries());
      
      // Only include search if there are actual parameters
      let queryString = '';
      if (paramEntries.length > 0) {
        // Sort parameters alphabetically
        paramEntries.sort((a, b) => a[0].localeCompare(b[0]));
        
        // Rebuild query string
        const sortedParams = new URLSearchParams();
        for (const [key, value] of paramEntries) {
          if (key) {
            sortedParams.append(key, value);
          }
        }
        
        queryString = sortedParams.toString();
        if (queryString) {
          queryString = `?${queryString}`;
        }
      }
      
      // Build the result URL
      let result = `${parsedUrl.protocol}//`;
      
      // Add auth if present
      if (parsedUrl.username) {
        result += encodeURIComponent(parsedUrl.username);
        if (parsedUrl.password) {
          result += `:${encodeURIComponent(parsedUrl.password)}`;
        }
        result += '@';
      }
      
      // Add hostname
      result += parsedUrl.hostname;
      
      // Add port if present
      if (parsedUrl.port) {
        result += `:${parsedUrl.port}`;
      }
      
      // Add path
      result += path;
      
      // Add trailing slash for root path if not already present
      if ((path === '' || path === '/') && !result.endsWith('/')) {
        result += '/';
      }
      
      // Add query string if present
      result += queryString;
      
      // Add hash if present
      result += parsedUrl.hash;
      
      return result;
    } catch {
      // If normalization fails, return the original URL
      return url;
    }
  }
  
  /**
   * Checks if two URLs are equivalent after normalization
   * 
   * @param url1 - First URL to compare
   * @param url2 - Second URL to compare
   * @returns True if the normalized URLs are equivalent
   */
  public static areEquivalent(url1: string, url2: string): boolean {
    return this.normalize(url1) === this.normalize(url2);
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

  /**
   * Checks if a string is a valid URL
   * 
   * @param url - URL to check
   * @returns True if URL is valid, false otherwise
   */
  private static isValidUrl(url: string): boolean {
    try {
      // If it already has a protocol, try to parse it directly
      if (url.toLowerCase().startsWith('http://') || url.toLowerCase().startsWith('https://')) {
        new URL(url);
        return true;
      }
      
      // Check if URL is valid before attempting to add protocol
      // This avoids treating strings like "not a url" as valid URLs
      if (!url.includes('.') && !url.match(/^(https?:\/\/|localhost)/i)) {
        return false;
      }
      
      // Otherwise, add a protocol and try to parse
      new URL(`https://${url}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Tests the URL normalizer with various URL formats including edge cases
   * This is useful for debugging and verifying normalization behavior
   * 
   * @returns An object with test results
   */
  public static test(): { original: string, normalized: string }[] {
    const testUrls = [
      'example.com',
      'https://example.com',
      'https://example.com/',
      'https://www.google.com/',
      'https://www.google.com/?',
      'https://www.google.com/?query=',
      'https://www.google.com/?query=value',
      'https://example.com/path',
      'https://example.com/path/',
      'https://example.com/path?',
      'https://example.com/path?a=1&b=2',
      'https://example.com/path?b=2&a=1',
      'https://example.com/path/?a=1&b=2',
      'https://example.com/path/?b=2&a=1',
      'HTTPS://EXAMPLE.COM/path',
      'https://example.com/PATH',
      'https://example.com/path?A=1&B=2',
      'https://example.com#fragment',
      'https://example.com/#fragment',
      'https://example.com/?#fragment',
      'https://user:pass@example.com',
      'http://example.com',
      'http://example.com/path',
      'https://example.com:8080',
      'https://example.com//path',
      'https://example.com/path///',
      'https://example.com/path%20with%20spaces',
      'https://example.com/übung',
      'https://example.com/?=value',
      'https://example.com/?param=',
      'https://example.com/?a=1&a=2',
      'https://user:pass%40special@example.com',
      'https://xn--bcher-kva.example',
      'https://example.com/CaseSensitivePath',
    ];
    
    return testUrls.map(url => ({
      original: url,
      normalized: this.normalize(url)
    }));
  }
}

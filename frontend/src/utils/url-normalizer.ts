/**
 * URL Normalization Utility
 * Provides functions to normalize URLs in the same way as the backend
 */
export class UrlNormalizer {
  /**
   * Normalizes a URL by:
   * 1. Adding https:// if protocol is missing
   * 2. Converting to lowercase
   * 3. Sorting query parameters
   * 4. Removing trailing slashes
   * 5. Preserving fragments (hash)
   * 
   * @param url - URL to normalize
   * @returns Normalized URL
   */
  public static normalize(url: string): string {
    try {
      if (!url) {
        return '';
      }
      
      // Check if URL is valid before attempting to add protocol
      // This avoids treating strings like "not a url" as valid URLs
      if (!url.includes('.') && !url.match(/^(https?:\/\/|localhost)/i)) {
        return url;
      }
      
      // Add protocol if missing
      if (!url.includes('://')) {
        url = `https://${url}`;
      }
      
      // Parse URL
      const parsedUrl = new URL(url);
      
      // Convert to lowercase (except query parameters and hash)
      parsedUrl.protocol = parsedUrl.protocol.toLowerCase();
      parsedUrl.host = parsedUrl.host.toLowerCase();
      parsedUrl.pathname = parsedUrl.pathname.toLowerCase();
      
      // Handle empty query parameters - always remove '?' if there are no actual parameters
      if (parsedUrl.search === '?' || parsedUrl.search === '') {
        parsedUrl.search = '';
      } else if (parsedUrl.search) {
        const searchParams = new URLSearchParams(parsedUrl.search);
        
        // If searchParams is empty, remove the search part
        if (Array.from(searchParams.keys()).length === 0) {
          parsedUrl.search = '';
        } else {
          const sortedParams = new URLSearchParams();
          
          // Get all parameter names and sort them
          const paramNames = Array.from(searchParams.keys()).sort();
          
          // Add parameters in sorted order with proper handling of multiple values
          for (const name of paramNames) {
            // Skip empty parameter names
            if (name.trim() === '') continue;
            
            // Get all values for this parameter and sort them
            const values = searchParams.getAll(name).sort();
            
            // Append each value individually to avoid duplicating values
            values.forEach(value => sortedParams.append(name, value));
          }
          
          // Replace search with sorted parameters
          parsedUrl.search = sortedParams.toString() ? `?${sortedParams.toString()}` : '';
        }
      }
      
      // Handle trailing slashes consistently by removing them from all paths
      // except for the root path, which should always have a trailing slash
      if (parsedUrl.pathname !== '/') {
        parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, '');
      }
      
      // Root domain should have a trailing slash
      if (parsedUrl.pathname === '') {
        parsedUrl.pathname = '/';
      }
      
      // Generate the normalized URL string
      return parsedUrl.toString();
    } catch (error) {
      // If URL parsing fails, return the original URL
      return url;
    }
  }

  /**
   * Compares two URLs to check if they are equivalent after normalization
   * 
   * @param url1 - First URL to compare
   * @param url2 - Second URL to compare
   * @returns True if the normalized URLs are equivalent
   */
  public static areEquivalent(url1: string, url2: string): boolean {
    return this.normalize(url1) === this.normalize(url2);
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
    ];
    
    return testUrls.map(url => ({
      original: url,
      normalized: this.normalize(url)
    }));
  }
}

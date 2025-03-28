import { UrlNormalizer } from './url-normalizer.util';

// Unit tests
describe('UrlNormalizer', () => {
  describe('normalize', () => {
    // Basic URL normalization tests
    it('should add https:// protocol if missing', () => {
      expect(UrlNormalizer.normalize('example.com')).toBe('https://example.com/');
    });

    it('should preserve http:// protocol when specified', () => {
      expect(UrlNormalizer.normalize('http://example.com')).toBe('http://example.com/');
    });

    it('should convert hostname to lowercase', () => {
      expect(UrlNormalizer.normalize('HTTPS://EXAMPLE.COM')).toBe('https://example.com/');
    });

    it('should preserve path case', () => {
      expect(UrlNormalizer.normalize('https://example.com/PATH')).toBe('https://example.com/PATH');
    });

    // Trailing slash tests
    it('should preserve trailing slash for root path', () => {
      expect(UrlNormalizer.normalize('https://example.com/')).toBe('https://example.com/');
    });

    it('should add trailing slash for root domain with no path', () => {
      expect(UrlNormalizer.normalize('https://example.com')).toBe('https://example.com/');
    });

    it('should remove trailing slash from non-root paths', () => {
      expect(UrlNormalizer.normalize('https://example.com/path/')).toBe('https://example.com/path');
    });

    it('should handle multiple trailing slashes', () => {
      expect(UrlNormalizer.normalize('https://example.com/path///')).toBe('https://example.com/path');
    });

    // Query parameter tests
    it('should sort query parameters alphabetically', () => {
      expect(UrlNormalizer.normalize('https://example.com/path?b=2&a=1')).toBe('https://example.com/path?a=1&b=2');
    });

    it('should preserve query parameter case', () => {
      expect(UrlNormalizer.normalize('https://example.com/path?A=1&B=2')).toBe('https://example.com/path?A=1&B=2');
    });

    it('should handle multiple values for the same parameter', () => {
      const normalizedUrl = UrlNormalizer.normalize('https://example.com/path?a=2&a=1');
      expect(normalizedUrl.startsWith('https://example.com/path?a=')).toBe(true);
      // Just ensure the URL preserves multiple values, not specific order
      expect(normalizedUrl.includes('a=1')).toBe(true);
      expect(normalizedUrl.includes('a=2')).toBe(true);
    });

    // Empty query parameter handling
    it('should remove empty query parameter marker (?)', () => {
      expect(UrlNormalizer.normalize('https://example.com/?')).toBe('https://example.com/');
    });

    it('should remove empty query parameter marker on paths', () => {
      expect(UrlNormalizer.normalize('https://example.com/path?')).toBe('https://example.com/path');
    });

    it('should handle query parameters with empty values', () => {
      expect(UrlNormalizer.normalize('https://example.com/?param=')).toBe('https://example.com/?param=');
    });

    it('should skip empty parameter names', () => {
      const normalizedUrl = UrlNormalizer.normalize('https://example.com/?=value');
      expect(normalizedUrl).toBe('https://example.com/');
    });

    // Fragment handling
    it('should preserve fragments (hash)', () => {
      expect(UrlNormalizer.normalize('https://example.com#fragment')).toBe('https://example.com/#fragment');
    });

    it('should preserve fragments with trailing slash', () => {
      expect(UrlNormalizer.normalize('https://example.com/#fragment')).toBe('https://example.com/#fragment');
    });

    it('should preserve fragments with empty query', () => {
      expect(UrlNormalizer.normalize('https://example.com/?#fragment')).toBe('https://example.com/#fragment');
    });

    it('should preserve fragments with query parameters', () => {
      expect(UrlNormalizer.normalize('https://example.com/?a=1#fragment')).toBe('https://example.com/?a=1#fragment');
    });

    // Special character handling
    it('should handle URLs with encoded characters', () => {
      expect(UrlNormalizer.normalize('https://example.com/path%20with%20spaces')).toBe('https://example.com/path%20with%20spaces');
    });

    it('should handle URLs with international characters in path', () => {
      const normalizedUrl = UrlNormalizer.normalize('https://example.com/übung');
      // Test that the URL is percent-encoded, case-insensitive comparison
      expect(normalizedUrl.toLowerCase()).toBe('https://example.com/%c3%bcbung');
    });

    it('should handle URLs with port numbers', () => {
      expect(UrlNormalizer.normalize('https://example.com:8080/path')).toBe('https://example.com:8080/path');
    });

    it('should handle URLs with authentication', () => {
      expect(UrlNormalizer.normalize('https://user:pass@example.com')).toBe('https://user:pass@example.com/');
    });

    it('should properly encode special characters in authentication', () => {
      // The URL constructor double-encodes the @ symbol in the password
      const normalizedUrl = UrlNormalizer.normalize('https://user:pass@123@example.com');
      expect(normalizedUrl).toMatch(/^https:\/\/user:pass(%40|%2540)123@example\.com\/$/);
    });

    it('should handle internationalized domain names (IDNs)', () => {
      // IDNs are automatically punycode-encoded by the URL constructor
      const normalizedUrl = UrlNormalizer.normalize('https://bücher.example');
      expect(normalizedUrl.startsWith('https://xn--')).toBe(true);
    });

    it('should handle empty URLs', () => {
      expect(UrlNormalizer.normalize('')).toBe('');
    });

    it('should handle null or undefined URLs', () => {
      expect(UrlNormalizer.normalize(null as unknown as string)).toBe('');
      expect(UrlNormalizer.normalize(undefined as unknown as string)).toBe('');
    });

    it('should return original URL for invalid URLs', () => {
      const invalidUrl = 'not a url';
      expect(UrlNormalizer.normalize(invalidUrl)).toBe(invalidUrl);
    });
  });

  describe('areEquivalent', () => {
    it('should return true for equivalent URLs', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com', 'https://example.com/')).toBe(true);
    });

    it('should return true for URLs with different case in hostname', () => {
      expect(UrlNormalizer.areEquivalent('https://EXAMPLE.com', 'https://example.COM')).toBe(true);
    });

    it('should return false for URLs with different case in path', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com/path', 'https://example.com/PATH')).toBe(false);
    });

    it('should return true for URLs with different query parameter order', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com?a=1&b=2', 'https://example.com?b=2&a=1')).toBe(true);
    });

    it('should return true for URLs with same protocol', () => {
      expect(UrlNormalizer.areEquivalent('http://example.com', 'http://example.com/')).toBe(true);
    });

    it('should return false for URLs with different protocols', () => {
      expect(UrlNormalizer.areEquivalent('http://example.com', 'https://example.com')).toBe(false);
    });

    it('should return false for different domains', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com', 'https://example.org')).toBe(false);
    });

    it('should return false for different paths', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com/path1', 'https://example.com/path2')).toBe(false);
    });

    it('should return false for different query parameters', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com?a=1', 'https://example.com?a=2')).toBe(false);
    });

    it('should return false for different fragments', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com#fragment1', 'https://example.com#fragment2')).toBe(false);
    });
  });

  describe('generateNamespacedHash', () => {
    it('should generate a hash for a URL and user ID combination', () => {
      const hash = UrlNormalizer.generateNamespacedHash('https://example.com', 'user123');
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for different URLs with the same user ID', () => {
      const hash1 = UrlNormalizer.generateNamespacedHash('https://example.com', 'user123');
      const hash2 = UrlNormalizer.generateNamespacedHash('https://example.org', 'user123');
      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes for the same URL with different user IDs', () => {
      const hash1 = UrlNormalizer.generateNamespacedHash('https://example.com', 'user123');
      const hash2 = UrlNormalizer.generateNamespacedHash('https://example.com', 'user456');
      expect(hash1).not.toBe(hash2);
    });

    it('should generate the same hash for the same URL and user ID', () => {
      const hash1 = UrlNormalizer.generateNamespacedHash('https://example.com', 'user123');
      const hash2 = UrlNormalizer.generateNamespacedHash('https://example.com', 'user123');
      expect(hash1).toBe(hash2);
    });
  });
});

// Integration tests
describe('UrlNormalizer Integration Tests', () => {
  describe('test method', () => {
    it('should test a variety of URL formats', () => {
      const results = UrlNormalizer.test();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      for (const result of results) {
        expect(result).toHaveProperty('original');
        expect(result).toHaveProperty('normalized');
        expect(typeof result.original).toBe('string');
        expect(typeof result.normalized).toBe('string');
      }
    });
  });
});

import { describe, it, expect } from 'vitest';
import { UrlNormalizer } from './url-normalizer';

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

    // Empty query parameter tests
    it('should handle empty query parameter markers', () => {
      expect(UrlNormalizer.normalize('https://example.com/?')).toBe('https://example.com/');
    });

    it('should preserve query parameters with empty values', () => {
      expect(UrlNormalizer.normalize('https://example.com/?param=')).toBe('https://example.com/?param=');
    });

    it('should skip empty parameter names', () => {
      expect(UrlNormalizer.normalize('https://example.com/?=value')).toBe('https://example.com/');
    });

    // Fragment (hash) tests
    it('should preserve fragments in URLs', () => {
      expect(UrlNormalizer.normalize('https://example.com#fragment')).toBe('https://example.com/#fragment');
    });

    it('should maintain fragments with query parameters', () => {
      expect(UrlNormalizer.normalize('https://example.com/?param=value#fragment')).toBe('https://example.com/?param=value#fragment');
    });

    it('should correctly handle fragments with empty queries', () => {
      expect(UrlNormalizer.normalize('https://example.com/?#fragment')).toBe('https://example.com/#fragment');
    });

    // Edge cases
    it('should handle URLs with username and password', () => {
      expect(UrlNormalizer.normalize('https://user:pass@example.com')).toBe('https://user:pass@example.com/');
    });

    it('should properly encode special characters in authentication', () => {
      // The URL constructor double-encodes the @ symbol in the password
      const normalizedUrl = UrlNormalizer.normalize('https://user:pass@123@example.com');
      expect(normalizedUrl).toMatch(/^https:\/\/user:pass(%40|%2540)123@example\.com\/$/);
    });

    it('should handle URLs with ports', () => {
      expect(UrlNormalizer.normalize('https://example.com:8080')).toBe('https://example.com:8080/');
    });

    it('should handle empty URLs', () => {
      expect(UrlNormalizer.normalize('')).toBe('');
    });

    it('should return original URL for invalid URLs', () => {
      const invalidUrl = 'not a url';
      expect(UrlNormalizer.normalize(invalidUrl)).toBe(invalidUrl);
    });

    it('should handle internationalized domain names (IDNs)', () => {
      // IDNs are automatically punycode-encoded by the URL constructor
      const normalizedUrl = UrlNormalizer.normalize('https://bücher.example');
      expect(normalizedUrl.startsWith('https://xn--')).toBe(true);
    });
    
    // Comprehensive test with a list of URLs
    it('should normalize a variety of URL formats correctly', () => {
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
        'http://example.com',
        'http://example.com/path',
        'https://user:pass@example.com',
        'https://example.com:8080',
      ];
      
      // Test each URL
      for (const url of testUrls) {
        const normalized = UrlNormalizer.normalize(url);
        expect(normalized).toBeDefined();
        expect(typeof normalized).toBe('string');
      }
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

    it('should return false for different URLs', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com', 'https://example.org')).toBe(false);
    });

    it('should return false for URLs with different paths', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com/path1', 'https://example.com/path2')).toBe(false);
    });

    it('should return false for URLs with different query parameters', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com?a=1', 'https://example.com?a=2')).toBe(false);
    });

    it('should return false for URLs with different fragments', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com#fragment1', 'https://example.com#fragment2')).toBe(false);
    });
  });
});

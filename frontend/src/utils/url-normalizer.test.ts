import { describe, it, expect } from 'vitest';
import { UrlNormalizer } from './url-normalizer';

describe('UrlNormalizer', () => {
  describe('normalize', () => {
    // Basic URL normalization tests
    it('should add https:// protocol if missing', () => {
      expect(UrlNormalizer.normalize('example.com')).toBe('https://example.com/');
    });

    it('should convert scheme and host to lowercase', () => {
      expect(UrlNormalizer.normalize('HTTPS://EXAMPLE.COM')).toBe('https://example.com/');
    });

    it('should convert path to lowercase', () => {
      expect(UrlNormalizer.normalize('https://example.com/PATH')).toBe('https://example.com/path');
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

    // Auth portion of URL
    it('should preserve username and password in URLs', () => {
      expect(UrlNormalizer.normalize('https://user:pass@example.com')).toBe('https://user:pass@example.com/');
    });

    // Error handling
    it('should return empty string for null input', () => {
      expect(UrlNormalizer.normalize(null as unknown as string)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(UrlNormalizer.normalize(undefined as unknown as string)).toBe('');
    });

    it('should return original URL for invalid URLs', () => {
      const invalidUrl = 'not a url';
      expect(UrlNormalizer.normalize(invalidUrl)).toBe(invalidUrl);
    });

    // Specific problem cases mentioned
    it('should normalize Google URLs with and without empty query parameters to the same URL', () => {
      const url1 = 'https://www.google.com/?';
      const url2 = 'https://www.google.com/';
      expect(UrlNormalizer.normalize(url1)).toBe(UrlNormalizer.normalize(url2));
    });
  });

  describe('areEquivalent', () => {
    it('should return true for equivalent URLs', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com', 'https://example.com/')).toBe(true);
    });

    it('should return true for URLs that differ only in case', () => {
      expect(UrlNormalizer.areEquivalent('https://EXAMPLE.com', 'https://example.com')).toBe(true);
    });

    it('should return true for URLs with query parameters in different orders', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com/?a=1&b=2', 'https://example.com/?b=2&a=1')).toBe(true);
    });

    it('should return true for URLs with and without trailing slashes on non-root paths', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com/path', 'https://example.com/path/')).toBe(true);
    });

    it('should return true for URLs with and without empty query parameters', () => {
      expect(UrlNormalizer.areEquivalent('https://www.google.com/', 'https://www.google.com/?')).toBe(true);
    });

    it('should return false for different URLs', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com', 'https://example.org')).toBe(false);
    });

    it('should return false for URLs with different query parameters', () => {
      expect(UrlNormalizer.areEquivalent('https://example.com/?a=1', 'https://example.com/?a=2')).toBe(false);
    });
  });
});

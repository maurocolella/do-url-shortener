describe('URL Creation Flow', () => {
  beforeEach(() => {
    // Mock the API response for login
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          provider: 'local'
        },
        accessToken: 'fake-jwt-token'
      }
    }).as('loginRequest');

    // Mock the API response for URL creation
    cy.intercept('POST', '/api/urls', {
      statusCode: 201,
      body: {
        id: 'test-url-id',
        slug: 'test-slug',
        originalUrl: 'https://example.com',
        shortUrl: 'http://short.url/test-slug',
        visits: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).as('createUrlRequest');

    // Mock the API response for fetching URLs
    cy.intercept('GET', '/api/urls', {
      statusCode: 200,
      body: [
        {
          id: 'test-url-id',
          slug: 'test-slug',
          originalUrl: 'https://example.com',
          shortUrl: 'http://short.url/test-slug',
          visits: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    }).as('fetchUrlsRequest');

    // Mock the API response for fetching stats
    cy.intercept('GET', '/api/urls/stats', {
      statusCode: 200,
      body: {
        totalUrls: 1,
        totalVisits: 0,
        topUrls: [
          {
            id: 'test-url-id',
            slug: 'test-slug',
            originalUrl: 'https://example.com',
            shortUrl: 'http://short.url/test-slug',
            visits: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      }
    }).as('fetchStatsRequest');

    // Login
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');

    // Navigate to dashboard
    cy.location('pathname').should('eq', '/dashboard');
    cy.wait('@fetchUrlsRequest');
    cy.wait('@fetchStatsRequest');
  });

  it('should create a new URL', () => {
    // Fill in the URL creation form
    cy.get('input[type="url"]').type('https://example.com');
    cy.get('button').contains('Shorten URL').click();
    cy.wait('@createUrlRequest');

    // Verify the URL was created and appears in the list
    cy.contains('https://example.com').should('be.visible');
    cy.contains('test-slug').should('be.visible');
  });

  it('should create a URL with custom slug', () => {
    // Mock the API response for URL creation with custom slug
    cy.intercept('POST', '/api/urls', {
      statusCode: 201,
      body: {
        id: 'custom-url-id',
        slug: 'custom-slug',
        originalUrl: 'https://example.org',
        shortUrl: 'http://short.url/custom-slug',
        visits: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).as('createCustomUrlRequest');

    // Enable custom slug
    cy.get('input[type="checkbox"]#customSlug').click();
    cy.get('input#slug').should('be.visible');

    // Fill in the URL creation form with custom slug
    cy.get('input[type="url"]').type('https://example.org');
    cy.get('input#slug').type('custom-slug');
    cy.get('button').contains('Shorten URL').click();
    cy.wait('@createCustomUrlRequest');

    // Verify the URL was created with custom slug
    cy.contains('https://example.org').should('be.visible');
    cy.contains('custom-slug').should('be.visible');
  });

  it('should show error when submitting invalid URL', () => {
    // Submit an invalid URL
    cy.get('input[type="url"]').type('invalid-url');
    cy.get('button').contains('Shorten URL').click();

    // Verify error message
    cy.contains('Please enter a valid URL').should('be.visible');
  });

  it('should copy shortened URL to clipboard', () => {
    // Create a URL first
    cy.get('input[type="url"]').type('https://example.com');
    cy.get('button').contains('Shorten URL').click();
    cy.wait('@createUrlRequest');

    // Mock clipboard API
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').resolves();
    });

    // Click on copy button
    cy.get('[data-testid="copy-button"]').first().click();

    // Verify success message
    cy.contains('URL copied to clipboard').should('be.visible');
  });
});

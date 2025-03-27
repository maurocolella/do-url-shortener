describe('Dashboard Page', () => {
  beforeEach(() => {
    // Mock the authentication state
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-jwt-token');
    });
    
    // Intercept API calls
    cy.intercept('GET', '**/api/url', {
      statusCode: 200,
      body: [
        {
          id: '1',
          originalUrl: 'https://example.com',
          shortUrl: 'http://localhost:3000/abc123',
          slug: 'abc123',
          visits: 42,
          createdAt: '2025-03-25T10:00:00.000Z',
          updatedAt: '2025-03-26T10:00:00.000Z',
        },
        {
          id: '2',
          originalUrl: 'https://another-example.com',
          shortUrl: 'http://localhost:3000/def456',
          slug: 'def456',
          visits: 15,
          createdAt: '2025-03-24T10:00:00.000Z',
          updatedAt: '2025-03-26T10:00:00.000Z',
        }
      ]
    }).as('getUrls');
    
    cy.visit('/dashboard');
    cy.wait('@getUrls');
  });

  it('should display the dashboard page correctly', () => {
    cy.contains('h1', 'Your URLs');
    cy.get('table').should('exist');
    cy.get('table tbody tr').should('have.length', 2);
  });

  it('should display URL details', () => {
    cy.contains('https://example.com');
    cy.contains('abc123');
    cy.contains('42'); // visits
  });

  it('should have functioning copy buttons', () => {
    // Mock clipboard API
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').resolves();
    });
    
    cy.contains('tr', 'example.com').find('button[title="Copy short URL"]').click();
    cy.window().its('navigator.clipboard.writeText').should('be.calledWith', 'http://localhost:3000/abc123');
  });

  it('should navigate to URL details page', () => {
    cy.intercept('GET', '**/api/url/1', {
      statusCode: 200,
      body: {
        id: '1',
        originalUrl: 'https://example.com',
        shortUrl: 'http://localhost:3000/abc123',
        slug: 'abc123',
        visits: 42,
        createdAt: '2025-03-25T10:00:00.000Z',
        updatedAt: '2025-03-26T10:00:00.000Z',
      }
    }).as('getUrlDetails');
    
    cy.contains('tr', 'example.com').find('button[title="View details"]').click();
    cy.url().should('include', '/url/1');
    cy.wait('@getUrlDetails');
    cy.contains('URL Details');
    cy.contains('https://example.com');
  });

  it('should allow creating a new URL', () => {
    cy.intercept('POST', '**/api/url', {
      statusCode: 201,
      body: {
        id: '3',
        originalUrl: 'https://new-example.com',
        shortUrl: 'http://localhost:3000/ghi789',
        slug: 'ghi789',
        visits: 0,
        createdAt: '2025-03-26T15:00:00.000Z',
        updatedAt: '2025-03-26T15:00:00.000Z',
      }
    }).as('createUrl');
    
    cy.get('button').contains('Create New URL').click();
    cy.get('input[type="url"]').type('https://new-example.com');
    cy.get('button').contains('Shorten').click();
    cy.wait('@createUrl');
    cy.contains('URL created successfully');
  });

  it('should allow logging out', () => {
    cy.get('button').contains('Logout').click();
    cy.url().should('include', '/login');
    cy.window().its('localStorage.token').should('be.undefined');
  });
});

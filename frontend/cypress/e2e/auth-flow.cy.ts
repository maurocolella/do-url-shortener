describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
  });

  describe('Registration', () => {
    it('should register a new user', () => {
      // Mock the API response for registration
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 201,
        body: {
          user: {
            id: 'new-user-id',
            email: 'newuser@example.com',
            firstName: 'New',
            lastName: 'User',
            provider: 'local'
          },
          accessToken: 'fake-jwt-token'
        }
      }).as('registerRequest');

      // Mock the API response for fetching URLs after registration
      cy.intercept('GET', '/api/urls', {
        statusCode: 200,
        body: []
      }).as('fetchUrlsRequest');

      // Mock the API response for fetching stats after registration
      cy.intercept('GET', '/api/urls/stats', {
        statusCode: 200,
        body: {
          totalUrls: 0,
          totalVisits: 0,
          topUrls: []
        }
      }).as('fetchStatsRequest');

      // Visit registration page
      cy.visit('/register');

      // Fill in registration form
      cy.get('input[name="firstName"]').type('New');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('newuser@example.com');
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('Password123!');

      // Submit form
      cy.get('button[type="submit"]').click();
      cy.wait('@registerRequest');

      // Verify redirect to dashboard
      cy.location('pathname').should('eq', '/dashboard');
      cy.wait('@fetchUrlsRequest');
      cy.wait('@fetchStatsRequest');

      // Verify user is logged in
      cy.contains('New User').should('be.visible');
    });

    it('should show error for existing email', () => {
      // Mock the API error response for registration with existing email
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 409,
        body: {
          message: 'Email already in use'
        }
      }).as('registerRequest');

      // Visit registration page
      cy.visit('/register');

      // Fill in registration form
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('existing@example.com');
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('Password123!');

      // Submit form
      cy.get('button[type="submit"]').click();
      cy.wait('@registerRequest');

      // Verify error message
      cy.contains('Email already in use').should('be.visible');
      cy.location('pathname').should('eq', '/register');
    });

    it('should validate password requirements', () => {
      // Visit registration page
      cy.visit('/register');

      // Fill in registration form with weak password
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('weak');
      cy.get('input[name="confirmPassword"]').type('weak');

      // Submit form
      cy.get('button[type="submit"]').click();

      // Verify validation message
      cy.contains('Password must be at least 8 characters').should('be.visible');
      cy.location('pathname').should('eq', '/register');
    });

    it('should validate password confirmation', () => {
      // Visit registration page
      cy.visit('/register');

      // Fill in registration form with mismatched passwords
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('DifferentPassword123!');

      // Submit form
      cy.get('button[type="submit"]').click();

      // Verify validation message
      cy.contains('Passwords do not match').should('be.visible');
      cy.location('pathname').should('eq', '/register');
    });
  });

  describe('Login', () => {
    it('should login an existing user', () => {
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

      // Mock the API response for fetching URLs after login
      cy.intercept('GET', '/api/urls', {
        statusCode: 200,
        body: []
      }).as('fetchUrlsRequest');

      // Mock the API response for fetching stats after login
      cy.intercept('GET', '/api/urls/stats', {
        statusCode: 200,
        body: {
          totalUrls: 0,
          totalVisits: 0,
          topUrls: []
        }
      }).as('fetchStatsRequest');

      // Visit login page
      cy.visit('/login');

      // Fill in login form
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('Password123!');

      // Submit form
      cy.get('button[type="submit"]').click();
      cy.wait('@loginRequest');

      // Verify redirect to dashboard
      cy.location('pathname').should('eq', '/dashboard');
      cy.wait('@fetchUrlsRequest');
      cy.wait('@fetchStatsRequest');

      // Verify user is logged in
      cy.contains('Test User').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      // Mock the API error response for login with invalid credentials
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: {
          message: 'Invalid credentials'
        }
      }).as('loginRequest');

      // Visit login page
      cy.visit('/login');

      // Fill in login form
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('WrongPassword123!');

      // Submit form
      cy.get('button[type="submit"]').click();
      cy.wait('@loginRequest');

      // Verify error message
      cy.contains('Invalid credentials').should('be.visible');
      cy.location('pathname').should('eq', '/login');
    });
  });

  describe('Logout', () => {
    it('should logout the user', () => {
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

      // Mock the API response for fetching URLs after login
      cy.intercept('GET', '/api/urls', {
        statusCode: 200,
        body: []
      }).as('fetchUrlsRequest');

      // Mock the API response for fetching stats after login
      cy.intercept('GET', '/api/urls/stats', {
        statusCode: 200,
        body: {
          totalUrls: 0,
          totalVisits: 0,
          topUrls: []
        }
      }).as('fetchStatsRequest');

      // Login first
      cy.visit('/login');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('Password123!');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginRequest');
      cy.location('pathname').should('eq', '/dashboard');

      // Click logout button
      cy.get('[data-testid="logout-button"]').click();

      // Verify redirect to login page
      cy.location('pathname').should('eq', '/login');

      // Verify user is logged out by trying to access dashboard
      cy.visit('/dashboard');
      cy.location('pathname').should('eq', '/login');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without authentication', () => {
      // Try to access dashboard without being logged in
      cy.visit('/dashboard');
      
      // Verify redirect to login page
      cy.location('pathname').should('eq', '/login');
    });

    it('should redirect to login when accessing URL details without authentication', () => {
      // Try to access URL details without being logged in
      cy.visit('/urls/test-url-id');
      
      // Verify redirect to login page
      cy.location('pathname').should('eq', '/login');
    });
  });
});

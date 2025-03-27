describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to login page', () => {
    cy.get('a').contains('Login').click();
    cy.url().should('include', '/login');
    cy.contains('h1', 'Welcome Back').should('be.visible');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button').contains('Sign in').should('exist');
  });

  it('should navigate to register page', () => {
    cy.get('a').contains('Register').click();
    cy.url().should('include', '/register');
    cy.contains('h1', 'Create an Account').should('be.visible');
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button').contains('Sign up').should('exist');
  });

  it('should show validation error on login form', () => {
    cy.visit('/login');
    cy.get('button').contains('Sign in').click();
    // Check for HTML5 validation message
    cy.get('input[type="email"]').then($input => {
      expect($input[0].validationMessage).to.not.be.empty;
    });
  });

  it('should show validation error on register form', () => {
    cy.visit('/register');
    cy.get('button').contains('Sign up').click();
    // Check for HTML5 validation message
    cy.get('input[type="email"]').then($input => {
      expect($input[0].validationMessage).to.not.be.empty;
    });
  });

  it('should have Google login option', () => {
    cy.visit('/login');
    cy.contains('Sign in with Google').should('be.visible');
    
    cy.visit('/register');
    cy.contains('Sign up with Google').should('be.visible');
  });
});

describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the homepage correctly', () => {
    cy.contains('h1', 'URL Shortener');
    cy.contains('Create short, easy-to-share links in seconds');
    cy.get('form').should('exist');
    cy.get('input[type="url"]').should('exist');
    cy.get('button').contains('Shorten URL').should('exist');
  });

  it('should show error when submitting empty URL', () => {
    cy.get('button').contains('Shorten URL').click();
    cy.contains('Please enter a URL').should('be.visible');
  });

  it('should toggle custom slug field when checkbox is clicked', () => {
    cy.get('input[type="checkbox"]#customSlug').should('exist');
    cy.get('input[type="checkbox"]#customSlug').click();
    cy.get('input#slug').should('be.visible');
    cy.get('input[type="checkbox"]#customSlug').click();
    cy.get('input#slug').should('not.exist');
  });

  it('should show features section', () => {
    cy.contains('Fast & Easy').should('be.visible');
    cy.contains('Secure & Reliable').should('be.visible');
    cy.contains('Detailed Analytics').should('be.visible');
  });
});

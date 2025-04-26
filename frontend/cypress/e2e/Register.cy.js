// cypress/e2e/self/register.cy.js
describe('注册页', () => {
  const base = Cypress.config('baseUrl');

  it('应加载并展示 Create Account 及输入框', () => {
    cy.visit(`${base}/register`);
    cy.contains('Create Account').should('be.visible');
    cy.get('input[placeholder="Choose a username"]').should('exist');
    cy.get('input[placeholder="Create a password"]').should('exist');
  });
});

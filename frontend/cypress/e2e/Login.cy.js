// cypress/e2e/self/login.cy.js
describe('登录页', () => {
  const base = Cypress.config('baseUrl');

  it('应加载并展示 Sign In 及输入框', () => {
    cy.visit(`${base}/login`);
    cy.contains('Sign In').should('be.visible');
    cy.get('input[placeholder="Enter your username"]').should('exist');
    cy.get('input[placeholder="Enter your password"]').should('exist');
  });
});

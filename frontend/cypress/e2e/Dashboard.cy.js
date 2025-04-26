// cypress/e2e/self/dashboard.cy.js
describe('仪表盘页', () => {
  const base = Cypress.config('baseUrl');

  it('应加载并展示筛选项', () => {
    cy.visit(`${base}/dashboard`, {
      onBeforeLoad(win) {
        win.localStorage.setItem('currentUser', 'guest');
      }
    });
    cy.contains('Industry').should('exist');
    cy.contains('Year').should('exist');
    cy.contains('Company').should('exist');
  });
});

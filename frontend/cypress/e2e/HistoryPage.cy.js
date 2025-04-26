// cypress/e2e/self/history.cy.js
describe('历史页', () => {
  const base = Cypress.config('baseUrl');

  it('无历史记录时应展示空状态提示', () => {
    cy.visit(`${base}/history`, {
      onBeforeLoad(win) {
        win.localStorage.setItem('currentUser', 'guest');
        win.localStorage.removeItem('report_history_guest');
      }
    });
    cy.contains('No report history found').should('be.visible');
  });
});

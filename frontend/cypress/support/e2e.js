// cypress/support/e2e.js

// 清除 localStorage
beforeEach(() => {
    cy.clearLocalStorage();
  });
  
  // 示例：自定义登录命令
  Cypress.Commands.add('login', ({ username, password, company }) => {
    cy.visit('/login');
    cy.get('input[placeholder="Enter your username"]').type(username);
    cy.get('input[placeholder="Enter your password"]').type(password);
    cy.get('input[placeholder="Enter your company name"]').type(company);
    cy.contains('Sign In').click();
  });
  
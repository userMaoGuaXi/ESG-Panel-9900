/// <reference types="cypress" />

describe('ESG Panel — 基础 E2E 测试', () => {
    const base = Cypress.config('baseUrl') || 'http://localhost:5174';
  
    it('1. 注册页应加载并展示 Create Account', () => {
      cy.visit(`${base}/register`);
      cy.contains('Create Account').should('be.visible');
      cy.get('input[placeholder="Choose a username"]').should('exist');
      cy.get('input[placeholder="Create a password"]').should('exist');
    });
  
    it('2. 登录页应加载并展示 Sign In', () => {
      cy.visit(`${base}/login`);
      cy.contains('Sign In').should('be.visible');
      cy.get('input[placeholder="Enter your username"]').should('exist');
      cy.get('input[placeholder="Enter your password"]').should('exist');
    });
  
    it('3. 仪表盘应加载并有筛选栏', () => {
      // 直接绕过登录，假设 localStorage.currentUser 已存在
      cy.visit(`${base}/dashboard`, {
        onBeforeLoad(win) {
          win.localStorage.setItem('currentUser', 'guest');
        }
      });
      cy.contains('Industry').should('exist');
      cy.contains('Year').should('exist');
      cy.contains('Company').should('be.visible');
    });
  
    it('4. 历史页加载状态', () => {
      cy.visit(`${base}/history`, {
        onBeforeLoad(win) {
          win.localStorage.setItem('currentUser', 'guest');
          // 清空历史，确保 Info 提示出现
          win.localStorage.removeItem('report_history_guest');
        }
      });
      cy.contains('No report history found').should('be.visible');
    });
  
    it('5. 直接访问报告页应提示错误', () => {
      cy.visit(`${base}/report`);
      cy.contains('No report data available').should('be.visible');
    });
  });
  
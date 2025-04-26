import React from 'react';
import Sidebar from '../../src/components/Sidebar';

describe('Sidebar 组件', () => {
  it('展示菜单项并点击 Logout 后清除 localStorage', () => {
    // 预先写入 localStorage
    cy.window().then(win => {
      win.localStorage.setItem('currentUser', 'Alice');
      win.localStorage.setItem('token', 'tok123');
    });

    cy.mountWithRouter(<Sidebar />);

    // 菜单项存在
    cy.contains('Dashboard').should('exist');
    cy.contains('Report History').should('exist');
    cy.contains('User Guide').should('exist');
    cy.contains('Logout').should('exist');

    // 点击 Logout
    cy.contains('Logout').click();

    // 断言 localStorage 已清空
    cy.window().then(win => {
      expect(win.localStorage.getItem('currentUser')).to.be.null;
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });
});

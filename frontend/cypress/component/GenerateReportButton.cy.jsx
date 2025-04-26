import React from 'react';
import GenerateReportButton from '../../src/components/GenerateReportButton';

describe('GenerateReportButton 组件', () => {
  it('没有 metric 时弹出 warning', () => {
    // 确保本地存储为空
    cy.clearLocalStorage(`report_metrics_guest`);

    cy.mountWithRouter(<GenerateReportButton />);

    cy.contains('Generate Report').click();
    cy.contains('No metrics added to report yet').should('be.visible');
  });
});

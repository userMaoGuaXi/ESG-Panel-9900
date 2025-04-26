import React from 'react';
import MetricCard from '../../src/components/MetricCard';

describe('MetricCard 组件', () => {
  it('渲染标题和按钮', () => {
    const metric = {
      metric_label: 'Test Metric',
      metric_uri: 'u1',
      categories_label: 'Test Category',
      categories_uri: 'cat1'
    };

    // 确保本地存储为空
    cy.clearLocalStorage(`report_metrics_guest`);

    cy.mountWithRouter(
      <MetricCard
        metric={metric}
        matchedMetrics={[]}
        industry="I"
        reportingYear="2022-12-31"
        company="Co"
        uniqueId="u1"
      />
    );

    cy.contains('Test Metric').should('be.visible');
    cy.contains('Add to Report').should('be.visible');
  });
});

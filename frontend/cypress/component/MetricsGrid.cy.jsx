import React from 'react';
import MetricsGrid from '../../src/components/MetricsGrid';

describe('MetricsGrid 组件', () => {
  it('渲染多个 category 项', () => {
    const data = [
      {
        category: { categories_uri: 'c1', categories_label: 'Cat1' },
        metrics: []
      },
      {
        category: { categories_uri: 'c2', categories_label: 'Cat2' },
        metrics: []
      }
    ];

    cy.mountWithRouter(
      <MetricsGrid
        combinedData={data}
        industry="I"
        reportingYear="2022-12-31"
        company="Co"
      />
    );

    cy.contains('Cat1').should('exist');
    cy.contains('Cat2').should('exist');
  });
});

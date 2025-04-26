import React from 'react';
import MetricDescription from '../../src/components/MetricDescription';

describe('MetricDescription 组件', () => {
  it('stub 描述并展示', () => {
    // 拦截接口
    cy.intercept('GET', '/stardog/getCategoryDescriptions', {
      statusCode: 200,
      body: [
        { category_name: 'TEST', description: 'This is a test description.' }
      ]
    });

    const metric = { categories_uri: 'TEST', categories_label: 'TEST' };

    cy.mountWithRouter(<MetricDescription metric={metric} />);

    cy.contains('This is a test description.').should('be.visible');
  });
});

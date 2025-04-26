import React from 'react';
import FilterBar from '../../src/components/FilterBar';

describe('FilterBar 组件', () => {
  it('渲染并触发回调', () => {
    const setIndustry = cy.stub().as('setIndustry');
    const setReportingYear = cy.stub().as('setReportingYear');
    const setCompany = cy.stub().as('setCompany');

    cy.mountWithRouter(
      <FilterBar
        industry="Semiconductors"
        reportingYear="2022-12-31"
        company="TestCo"
        setIndustry={setIndustry}
        setReportingYear={setReportingYear}
        setCompany={setCompany}
      />
    );

    // 首先验证基本的UI元素是否存在
    cy.contains('Industry').should('exist');
    cy.contains('Year').should('exist');
    cy.contains('Generate Report').should('exist');
    cy.contains('Company').should('exist');

    // 使用更基本的方法获取所有输入框
    cy.get('input').then($inputs => {
      // 假设第三个输入框是Company输入框(第一个和第二个可能是Industry和Year的Select组件内部的输入)
      cy.wrap($inputs.eq(2))
        .should('exist')
        .should('have.value', 'TestCo');
        
      // 修改company输入并触发失焦事件
      cy.wrap($inputs.eq(2))
        .clear()
        .type('NewCo')
        .blur();
      cy.get('@setCompany').should('have.been.calledWith', 'NewCo');
    });

    // 使用更简单的方法处理Industry下拉选择
    cy.get('label').contains('Industry').parent().click();
    cy.contains('li', 'Biotechnology & Pharmaceuticals').click();
    cy.get('@setIndustry').should('have.been.calledWith', 'Biotechnology %26 Pharmaceuticals');
  });
});
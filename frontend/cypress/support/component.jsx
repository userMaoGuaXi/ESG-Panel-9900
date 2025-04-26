import React from "react";
import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";

// 全局挂载 helper
Cypress.Commands.add("mountWithRouter", (jsx, options = {}) => {
  return mount(<MemoryRouter>{jsx}</MemoryRouter>, options);
});

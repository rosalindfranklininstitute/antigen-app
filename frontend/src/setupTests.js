import "@testing-library/jest-dom/vitest";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Headless UI ComboBox needs ResizeObserver which jsdom doesn't provide
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

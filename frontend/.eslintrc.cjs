module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  globals: {
    // Vitest globals (configured via globals: true in vite.config.js)
    vi: "readonly",
    describe: "readonly",
    it: "readonly",
    test: "readonly",
    expect: "readonly",
    beforeEach: "readonly",
    afterEach: "readonly",
    beforeAll: "readonly",
    afterAll: "readonly",
  },
  rules: {
    // React is imported in many files for JSX, but with the automatic JSX
    // runtime it doesn't appear as an explicit reference. Suppress the
    // false-positive rather than removing the imports across the codebase.
    "no-unused-vars": ["error", { varsIgnorePattern: "^React$", args: "none" }],
  },
  overrides: [
    {
      // CJS config files use CommonJS module syntax
      files: ["*.cjs"],
      env: { node: true },
    },
    {
      // Test and setup files run in Node/jsdom where `global` is available
      files: ["src/**/*.test.*", "src/setupTests.js"],
      env: { node: true },
    },
  ],
};

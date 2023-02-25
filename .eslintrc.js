module.exports = {
    parser: "@typescript-eslint/parser",
    extends: [
      "plugin:@typescript-eslint/recommended",
      "prettier/@typescript-eslint",
      "plugin:prettier/recommended",
    ],
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
      "project": "./tsconfig.json"
    },
    rules: {
      "require-await": "off",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/no-floating-promises": ["error"]
    },
  };
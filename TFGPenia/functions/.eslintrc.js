// functions/.eslintrc.js
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "quotes": ["error", "double", {avoidEscape: true}],
    "object-curly-spacing": ["error", "never"],
    "arrow-parens": ["error", "as-needed"],
    "brace-style": ["error", "1tbs", {allowSingleLine: true}],
    "spaced-comment": ["error", "always"],
    "max-len": ["warn", {code: 120, ignoreUrls: true}],
    "require-jsdoc": "off",
    "camelcase": "off",
    "one-var": "off",
    "no-unused-vars": ["warn", {argsIgnorePattern: "^_", varsIgnorePattern: "^unused"}],
  },
  overrides: [
    {
      files: ["**/*.spec.*", "**/test/**/*.*"],
      env: {mocha: true, jest: true},
      rules: {},
    },
  ],
};

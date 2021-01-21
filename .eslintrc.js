module.exports = {
  extends: ["@denkristoffer/eslint-config"],
  rules: {
    "@typescript-eslint/restrict-template-expressions": "off",
    "jest/no-deprecated-functions": "off",
    "jsx-a11y/no-onchange": "off",
    // React is included by next
    "react/react-in-jsx-scope": "off",
  },
};

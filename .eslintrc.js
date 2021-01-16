module.exports = {
  extends: ["@denkristoffer/eslint-config"],
  rules: {
    "jest/no-deprecated-functions": "off",
    "jsx-a11y/no-onchange": "off",
    // React is included by next
    "react/react-in-jsx-scope": "off",
  },
};

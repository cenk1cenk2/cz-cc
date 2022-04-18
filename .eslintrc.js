/** @type {import("eslint").Linter } */
module.exports = {
  extends: [ '@cenk1cenk2/eslint-config/index', '@cenk1cenk2/eslint-config/import-strict' ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  }
}

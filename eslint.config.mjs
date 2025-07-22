import { configs } from '@cenk1cenk2/eslint-config'

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...configs.javascript,
  {
    languageOptions: {
      ecmaVersion: 2020
    }
  },
  {
    ignores: ['dist/']
  }
]

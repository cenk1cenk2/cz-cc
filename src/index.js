import { configLoader } from 'commitizen'
import commitTypes from 'conventional-commit-types'

import engine from './engine'

function bootstrap() {
  const config = configLoader.load() || {}

  const options = {
    types: config.types || commitTypes.types,
    defaultType: process.env.CZ_TYPE || config.defaultType || 'fix',
    defaultScope: process.env.CZ_SCOPE || config.defaultScope,
    defaultSubject: process.env.CZ_SUBJECT || config.defaultSubject,
    defaultBody: process.env.CZ_BODY || config.defaultBody,
    defaultIssues: process.env.CZ_ISSUES || config.defaultIssues,
    disableScopeLowerCase:
      process.env.DISABLE_SCOPE_LOWERCASE || config.disableScopeLowerCase,
    maxHeaderWidth:
      (process.env.CZ_MAX_HEADER_WIDTH &&
        Number.parseInt(process.env.CZ_MAX_HEADER_WIDTH, 10)) ||
      config.maxHeaderWidth ||
      100,
    maxLineWidth:
      (process.env.CZ_MAX_LINE_WIDTH &&
        Number.parseInt(process.env.CZ_MAX_LINE_WIDTH, 10)) ||
      config.maxLineWidth ||
      100
  }

  return engine(options)
}

export default bootstrap()

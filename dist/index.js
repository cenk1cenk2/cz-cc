"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _commitizen = require("commitizen");

var _conventionalCommitTypes = _interopRequireDefault(require("conventional-commit-types"));

var _engine = _interopRequireDefault(require("./engine"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bootstrap() {
  const config = _commitizen.configLoader.load() || {};
  const options = {
    types: config.types || _conventionalCommitTypes.default.types,
    defaultType: process.env.CZ_TYPE || config.defaultType || 'fix',
    defaultScope: process.env.CZ_SCOPE || config.defaultScope,
    defaultSubject: process.env.CZ_SUBJECT || config.defaultSubject,
    defaultBody: process.env.CZ_BODY || config.defaultBody,
    defaultIssues: process.env.CZ_ISSUES || config.defaultIssues,
    disableScopeLowerCase: process.env.DISABLE_SCOPE_LOWERCASE || config.disableScopeLowerCase,
    maxHeaderWidth: process.env.CZ_MAX_HEADER_WIDTH && parseInt(process.env.CZ_MAX_HEADER_WIDTH, 10) || config.maxHeaderWidth || 100,
    maxLineWidth: process.env.CZ_MAX_LINE_WIDTH && parseInt(process.env.CZ_MAX_LINE_WIDTH, 10) || config.maxLineWidth || 100
  };

  try {
    const commitlint = require('@commitlint/load');

    commitlint.default().then(function (clConfig) {
      if (clConfig.rules) {
        const maxHeaderLengthRule = clConfig.rules['header-max-length'];

        if (typeof maxHeaderLengthRule === 'object' && maxHeaderLengthRule.length >= 3 && !process.env.CZ_MAX_HEADER_WIDTH && !config.maxHeaderWidth) {
          options.maxHeaderWidth = maxHeaderLengthRule[2];
        }
      }
    }); // eslint-disable-next-line no-empty
  } catch (err) {}

  return (0, _engine.default)(options);
}

var _default = bootstrap();

exports.default = _default;
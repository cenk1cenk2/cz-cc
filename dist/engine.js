"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _chalk = _interopRequireDefault(require("chalk"));

var _listr = require("listr2");

var _lodash = _interopRequireDefault(require("lodash.map"));

var _longest = _interopRequireDefault(require("longest"));

var _wordWrap = _interopRequireDefault(require("word-wrap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function filter(array) {
  return array.filter(function (x) {
    return x;
  });
}

function headerLength(answers) {
  return answers.type.length + 2 + (answers.scope ? answers.scope.length + 2 : 0);
}

function maxSummaryLength(options, answers) {
  return options.maxHeaderWidth - headerLength(answers);
}

function filterSubject(subject) {
  subject = subject.trim();

  if (subject.charAt(0).toLowerCase() !== subject.charAt(0)) {
    subject = subject.charAt(0).toLowerCase() + subject.slice(1, subject.length);
  }

  while (subject.endsWith('.')) {
    subject = subject.slice(0, subject.length - 1);
  }

  return subject;
}

function _default(options) {
  const types = options.types;
  const choices = (0, _lodash.default)(types, function (type, key) {
    const length = (0, _longest.default)(Object.keys(types)).length + 1;
    return {
      name: (key + ':').padEnd(length) + ' ' + type.description,
      value: key
    };
  });
  return {
    prompter(cz, commit) {
      new _listr.Listr([{
        title: 'Please provide the general commit details.',
        task: async (ctx, task) => ctx.prompts = await task.prompt([{
          type: 'AutoComplete',
          name: 'type',
          message: 'Type of commit:',
          choices,
          initial: choices.findIndex(val => val.value === options.defaultType)
        }, {
          type: 'Input',
          name: 'subject',
          message: answers => {
            return `Write a short description (max ${maxSummaryLength(options, answers)} chars):\n`;
          },
          initial: options.defaultSubject,
          required: true,
          validate: value => {
            const filteredSubject = filterSubject(value);
            return filteredSubject.length <= options.maxHeaderWidth ? true : `Subject length must be less than or equal to ${options.maxHeaderWidth} characters. Current length is ${filteredSubject.length} characters.`;
          }
        }, {
          type: 'MultiSelect',
          name: 'additional',
          message: 'Please select additional actions.',
          choices: [{
            name: 'scope',
            message: 'add a scope'
          }, {
            name: 'issue',
            message: 'resolves issues'
          }, {
            name: 'breaking-changes',
            message: 'introduces breaking changes'
          }, {
            name: 'long-description',
            message: 'add a long description'
          }]
        }])
      }, {
        title: 'Please provide additional details for the commit.',
        task: (ctx, task) => task.newListr([{
          skip: ctx => !ctx.prompts.additional.includes('scope'),
          task: async (ctx, task) => {
            ctx.prompts.scope = await task.prompt({
              type: 'Input',
              message: 'Please state the scope of the change:\n',
              initial: options.defaultScope,
              format: value => {
                return options.disableScopeLowerCase ? value.trim() : value.trim().toLowerCase();
              }
            });
          }
        }, {
          skip: ctx => !ctx.prompts.additional.some(property => ['issue', 'long-description', 'breaking-changes'].includes(property)),
          task: async (ctx, task) => {
            ctx.prompts.body = await task.prompt({
              type: 'Input',
              message: 'Please give a long description:\n',
              initial: options.defaultBody,
              required: false
            });
          }
        }, {
          skip: ctx => !ctx.prompts.additional.includes('issue'),
          task: async (ctx, task) => {
            ctx.prompts.issue = await task.prompt({
              type: 'Input',
              message: 'Add issue references (e.g. "fix #123", "re #123".):\n',
              initial: options.defaultIssues
            });
          }
        }, {
          skip: ctx => !ctx.prompts.additional.includes('breaking-changes'),
          task: async (ctx, task) => {
            ctx.prompts.breaking = await task.prompt({
              type: 'Input',
              message: 'Describe the breaking changes:\n'
            });
          }
        }])
      }], {
        rendererOptions: {
          collapse: false
        }
      }).run().then(ctx => {
        const wrapOptions = {
          trim: true,
          cut: false,
          newline: '\n',
          indent: '',
          width: options.maxLineWidth
        }; // parentheses are only needed when a scope is present

        const scope = ctx.prompts.scope ? `(${ctx.prompts.scope})` : ''; // Hard limit this line in the validate

        const head = ctx.prompts.type + scope + ': ' + ctx.prompts.subject; // Wrap these lines at options.maxLineWidth characters

        const body = ctx.prompts.body ? (0, _wordWrap.default)(ctx.prompts.body, wrapOptions) : false; // Apply breaking change prefix, removing it if already present

        let breaking = ctx.prompts.breaking ? ctx.prompts.breaking.trim() : '';
        breaking = breaking ? 'BREAKING CHANGE: ' + breaking.replace(/^BREAKING CHANGE: /, '') : '';
        breaking = breaking ? (0, _wordWrap.default)(breaking, wrapOptions) : false;
        const issues = ctx.prompts.issues ? (0, _wordWrap.default)(ctx.prompts.issues, wrapOptions) : false;
        commit(filter([head, body, breaking, issues]).join('\n\n'));
      }).catch(() => {
        // eslint-disable-next-line no-console
        console.log(_chalk.default.yellow('Cancelled. Skipping...'));
      });
    }

  };
}
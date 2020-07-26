import chalk from 'chalk'
import { prompt } from 'enquirer'
import map from 'lodash.map'
import longest from 'longest'
import wrap from 'word-wrap'

function filter (array) {
  return array.filter(function (x) {
    return x
  })
}

function headerLength (answers) {
  return (
    answers.type.length + 2 + (answers.scope ? answers.scope.length + 2 : 0)
  )
}

function maxSummaryLength (options, answers) {
  return options.maxHeaderWidth - headerLength(answers)
}

function filterSubject (subject) {
  subject = subject.trim()
  if (subject.charAt(0).toLowerCase() !== subject.charAt(0)) {
    subject =
      subject.charAt(0).toLowerCase() + subject.slice(1, subject.length)
  }
  while (subject.endsWith('.')) {
    subject = subject.slice(0, subject.length - 1)
  }
  return subject
}

export default function (options) {
  const types = options.types

  const choices = map(types, function (type, key) {
    const length = longest(Object.keys(types)).length + 1
    return {
      name: (key + ':').padEnd(length) + ' ' + type.description,
      value: key
    }
  })

  console.log(choices)

  return {
    prompter (cz, commit) {
      prompt([
        {
          type: 'autocomplete',
          name: 'type',
          message: 'Type of commit:',
          choices,
          initial: choices.findIndex((val) => val.value === options.defaultType)
        },
        {
          type: 'input',
          name: 'subject',
          message: (answers) => {
            return `Write a short description (max ${maxSummaryLength(options, answers)} chars):\n`
          },
          initial: options.defaultSubject,
          required: true,
          validate: (value) => {
            const filteredSubject = filterSubject(value)

            return filteredSubject.length <= options.maxHeaderWidth
              ? true
              : `Subject length must be less than or equal to ${options.maxHeaderWidth} characters. Current length is ${filteredSubject.length} characters.`
          }
        },
        {
          type: 'multiselect',
          name: 'additional',
          message: 'Please select additional actions.',
          choices: [
            { name: 'scope', message: 'add a scope' },
            { name: 'issue', message: 'resolves issues' },
            { name: 'breaking-changes', message: 'introduces breaking changes' },
            { name: 'long-description', message: 'add a long description' }
          ]
        },
        {
          type: 'input',
          name: 'scope',
          message: 'Please state the scope of the change:',
          initial: options.defaultScope,
          skip: (answers) => {
            console.log(answers)
            // @ts-ignore
            if (answers.additional.includes('scope')) {
              return true
            }
          },
          format: (value) => {
            return options.disableScopeLowerCase
              ? value.trim()
              : value.trim().toLowerCase()
          }
        }
      ]).then((answers) => {

        console.log(answers)

        const wrapOptions = {
          trim: true,
          cut: false,
          newline: '\n',
          indent: '',
          width: options.maxLineWidth
        }

        // parentheses are only needed when a scope is present
        const scope = answers.scope ? '(' + answers.scope + ')' : ''

        // Hard limit this line in the validate
        const head = answers.type + scope + ': ' + answers.subject

        // Wrap these lines at options.maxLineWidth characters
        const body = answers.body ? wrap(answers.body, wrapOptions) : false

        // Apply breaking change prefix, removing it if already present
        const breaking = answers.breaking ? answers.breaking.trim() : ''
        breaking = breaking
          ? 'BREAKING CHANGE: ' + breaking.replace(/^BREAKING CHANGE: /, '')
          : ''
        breaking = breaking ? wrap(breaking, wrapOptions) : false

        const issues = answers.issues ? wrap(answers.issues, wrapOptions) : false

        commit(filter([ head, body, breaking, issues ]).join('\n\n'))
      }).catch((err) => {
        console.log('Cancelled prompt. Skipping.' )
      })

      // cz.prompt([
      //   {
      //     type: 'input',
      //     name: 'scope',
      //     message:
      //       'What is the scope of this change (e.g. component or file name): (press enter to skip)',
      //     default: options.defaultScope,
      //     filter (value) {
      //
      //     }
      //   },
      //   {
      //     type: 'input',
      //     name: 'subject',
      //     message (answers) {
      //       return (
      //         'Write a short, imperative tense description of the change (max ' +
      //         maxSummaryLength(options, answers) +
      //         ' chars):\n'
      //       )
      //     },
      //     default: options.defaultSubject,
      //     validate (subject, answers) {
      //       const filteredSubject = filterSubject(subject)
      //       return filteredSubject.length === 0
      //         ? 'subject is required'
      //         : filteredSubject.length <= maxSummaryLength(options, answers)
      //           ? true
      //           : 'Subject length must be less than or equal to ' +
      //           maxSummaryLength(options, answers) +
      //           ' characters. Current length is ' +
      //           filteredSubject.length +
      //           ' characters.'
      //     },
      //     transformer (subject, answers) {
      //       const filteredSubject = filterSubject(subject)
      //       const color =
      //         filteredSubject.length <= maxSummaryLength(options, answers)
      //           ? chalk.green
      //           : chalk.red
      //       return color('(' + filteredSubject.length + ') ' + subject)
      //     },
      //     filter (subject) {
      //       return filterSubject(subject)
      //     }
      //   },
      //   {
      //     type: 'input',
      //     name: 'body',
      //     message:
      //       'Provide a longer description of the change: (press enter to skip)\n',
      //     default: options.defaultBody
      //   },
      //   {
      //     type: 'confirm',
      //     name: 'isBreaking',
      //     message: 'Are there any breaking changes?',
      //     default: false
      //   },
      //   {
      //     type: 'input',
      //     name: 'breakingBody',
      //     default: '-',
      //     message:
      //       'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself:\n',
      //     when (answers) {
      //       return answers.isBreaking && !answers.body
      //     },
      //     validate (breakingBody, answers) {
      //       return (
      //         breakingBody.trim().length > 0 ||
      //         'Body is required for BREAKING CHANGE'
      //       )
      //     }
      //   },
      //   {
      //     type: 'input',
      //     name: 'breaking',
      //     message: 'Describe the breaking changes:\n',
      //     when (answers) {
      //       return answers.isBreaking
      //     }
      //   },

      //   {
      //     type: 'confirm',
      //     name: 'isIssueAffected',
      //     message: 'Does this change affect any open issues?',
      //     default: options.defaultIssues ? true : false
      //   },
      //   {
      //     type: 'input',
      //     name: 'issuesBody',
      //     default: '-',
      //     message:
      //       'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself:\n',
      //     when (answers) {
      //       return (
      //         answers.isIssueAffected && !answers.body && !answers.breakingBody
      //       )
      //     }
      //   },
      //   {
      //     type: 'input',
      //     name: 'issues',
      //     message: 'Add issue references (e.g. "fix #123", "re #123".):\n',
      //     when (answers) {
      //       return answers.isIssueAffected
      //     },
      //     default: options.defaultIssues ? options.defaultIssues : undefined
      //   }
      // ])
    }
  }
}

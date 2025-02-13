import { ListrEnquirerPromptAdapter } from '@listr2/prompt-adapter-enquirer'
import Enquirer from 'enquirer'
import findGitRoot from 'find-git-root'
import fs from 'fs'
import { Listr, color } from 'listr2'
import { EOL } from 'os'
import { join } from 'path'

import { EditorPrompt } from './prompt'

export default function(options) {
  const choices = Object.entries(options.types).map(([key, type]) => {
    return {
      name: key,
      hint: type.description,
      value: key
    }
  })

  return {
    prompter(cz, commit) {
      new Listr(
        [
          {
            enabled: () => {
              // try for merge message
              const gitRoot = findGitRoot(process.cwd())
              const commitMsg = join(gitRoot, 'COMMIT_EDITMSG')

              if (gitRoot) {
                try {
                  const lastCommit = fs.readFileSync(commitMsg, 'utf-8')

                  if (new RegExp(/^Merge branch/).test(lastCommit)) {
                    return true
                  }

                  // eslint-disable-next-line no-empty
                } catch {}
              }
            },
            task: async(ctx, task) => {
              if (
                await task.prompt(ListrEnquirerPromptAdapter).run({
                  type: 'Toggle',
                  message: 'Last commit was found as merge commit do you want to skip?',
                  initial: true
                })
              ) {
                throw new Error('Skipping because of merge commit.')
              }
            }
          },

          {
            task: async(ctx, task) =>
              (ctx.prompts = await task.prompt(ListrEnquirerPromptAdapter).run([
                {
                  type: 'autocomplete',
                  name: 'type',
                  message: 'Type of commit:',
                  choices,
                  initial: choices.findIndex((val) => val.value === options.defaultType)
                },

                {
                  type: 'Input',
                  name: 'subject',
                  message: 'Write a short description:' + EOL,
                  initial: options.defaultSubject,
                  required: true
                },

                {
                  type: 'MultiSelect',
                  name: 'additional',
                  message: 'Please select additional actions.',
                  choices: [
                    { name: 'scope', message: 'add a scope' },
                    { name: 'issue', message: 'resolves issues' },
                    {
                      name: 'breaking-changes',
                      message: 'introduces breaking changes'
                    },
                    {
                      name: 'long-description',
                      message: 'add a long description'
                    },
                    { name: 'skip-ci', message: 'skip ci/cd setups' }
                  ]
                }
              ]))
          },

          {
            task: (ctx, task) =>
              task.newListr([
                {
                  skip: (ctx) => !ctx.prompts.additional.includes('scope'),
                  task: async(ctx, task) => {
                    ctx.prompts.scope = await task.prompt(ListrEnquirerPromptAdapter).run({
                      type: 'Input',
                      message: 'Please state the scope of the change:' + EOL,
                      initial: options.defaultScope,
                      format: (value) => {
                        return options.disableScopeLowerCase ? value.trim() : value.trim().toLowerCase()
                      }
                    })
                  }
                },

                {
                  skip: (ctx) => !ctx.prompts.additional.some((property) => ['long-description'].includes(property)),
                  task: async(ctx, task) => {
                    const enquirer = new Enquirer().register('editor', EditorPrompt)

                    ctx.prompts.body = await task.prompt(ListrEnquirerPromptAdapter).run(
                      [
                        {
                          type: 'editor',
                          name: 'default',
                          message: 'Please give a long description:' + EOL,
                          initial: options.defaultBody
                        }
                      ],
                      { enquirer }
                    )
                  }
                },

                {
                  skip: (ctx) => !ctx.prompts.additional.includes('issue'),
                  task: async(ctx, task) => {
                    ctx.prompts.issues = await task.prompt(ListrEnquirerPromptAdapter).run({
                      type: 'input',
                      message: 'Add issue references:' + EOL,
                      hint: 'fix #123, re #124',
                      initial: options.defaultIssues
                    })
                  }
                },

                {
                  skip: (ctx) => !ctx.prompts.additional.includes('breaking-changes'),
                  task: async(ctx, task) => {
                    ctx.prompts.breaking = await task.prompt(ListrEnquirerPromptAdapter).run({
                      type: 'editor',
                      message: 'Describe the breaking changes:' + EOL
                    })
                  }
                }
              ])
          }
        ],
        {
          rendererOptions: { collapseSubtasks: false },
          fallbackRendererCondition: false
        }
      )
        .run()
        .then((ctx) => {
          // parentheses are only needed when a scope is present
          const scope = ctx.prompts.scope ? `(${ctx.prompts.scope})` : ''

          // Hard limit this line in the validate
          let head = ctx.prompts.type + scope + ': ' + ctx.prompts.subject

          if (ctx.prompts.additional.includes('skip-ci')) {
            head = head + ' [skip ci]'
          }

          // Wrap these lines at options.maxLineWidth characters
          const body = ctx.prompts.body

          // Apply breaking change prefix, removing it if already present
          const breaking = ctx.prompts.breaking ? 'BREAKING CHANGE: ' + ctx.prompts.breaking.trim().replace(/^BREAKING CHANGE: /, '') : false

          const issues = ctx.prompts.issues

          commit([head, body, breaking, issues].filter(Boolean).join(EOL + EOL))
        })
        .catch(() => {
          // eslint-disable-next-line no-console
          console.log(color.yellow('Cancelled. Skipping...'))
        })
    }
  }
}

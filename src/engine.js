/* eslint-disable no-undef */
import { ListrInquirerPromptAdapter } from '@listr2/prompt-adapter-inquirer'
import findGitRoot from 'find-git-root'
import fs from 'fs'
import { Listr, color } from 'listr2'
import { EOL } from 'os'
import { join } from 'path'
import { confirm, select, input, checkbox, editor } from '@inquirer/prompts'

export default function(options) {
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
                await task.prompt(ListrInquirerPromptAdapter).run(confirm, {
                  message: 'Last commit was found as merge commit do you want to skip?',
                  default: true
                })
              ) {
                throw new Error('Skipping because of merge commit.')
              }
            }
          },

          {
            task: async(ctx, task) => {
              const choices = Object.entries(options.types).map(([key, type]) => {
                return {
                  name: key,
                  description: type.description,
                  value: key
                }
              })

              ctx.prompts.type = await task.prompt(ListrInquirerPromptAdapter).run(select, {
                message: 'Type of commit:',
                choices,
                default: options.defaultType
              })

              ctx.prompts.subject = await task.prompt(ListrInquirerPromptAdapter).run(input, {
                message: 'Write a short description:',
                default: options.defaultSubject,
                required: true
              })

              ctx.prompts.additional = await task.prompt(ListrInquirerPromptAdapter).run(checkbox, {
                message: 'Please select additional actions.',
                choices: [
                  {
                    name: 'scope',
                    value: 'scope',
                    description: 'Add a scope to the commit message.'
                  },
                  {
                    name: 'issue',
                    value: 'issue',
                    description: 'Resolve Issues by additional comments.'
                  },
                  {
                    name: 'breaking-changes',
                    value: 'breaking-changes',
                    description: 'Note breaking changes in the commit message.'
                  },
                  {
                    name: 'long-description',
                    value: 'long-description',
                    description: 'Add a long description to the commit message.'
                  },
                  {
                    name: 'skip-ci',
                    value: 'skip-ci',
                    description: 'Skip CI/CD setups.'
                  }
                ]
              })
            }
          },

          {
            task: (ctx, task) =>
              task.newListr([
                {
                  skip: (ctx) => !ctx.prompts.additional.includes('scope'),
                  task: async(ctx, task) => {
                    ctx.prompts.scope = await task.prompt(ListrInquirerPromptAdapter).run(input, {
                      message: 'Please state the scope of the change:',
                      default: options.defaultScope,
                      transformer: (value) => {
                        return options.disableScopeLowerCase ? value.trim() : value.trim().toLowerCase()
                      }
                    })
                  }
                },

                {
                  skip: (ctx) => !ctx.prompts.additional.some((property) => ['long-description'].includes(property)),
                  task: async(ctx, task) => {
                    ctx.prompts.body = await task.prompt(ListrInquirerPromptAdapter).run(editor, {
                      message: 'Please give a long description:',
                      default: options.defaultBody
                    })
                  }
                },

                {
                  skip: (ctx) => !ctx.prompts.additional.includes('issue'),
                  task: async(ctx, task) => {
                    ctx.prompts.issues = await task.prompt(ListrInquirerPromptAdapter).run(input, {
                      message: 'Add issue references:',
                      default: options.defaultIssues
                    })
                  }
                },

                {
                  skip: (ctx) => !ctx.prompts.additional.includes('breaking-changes'),
                  task: async(ctx, task) => {
                    ctx.prompts.breaking = await task.prompt(ListrInquirerPromptAdapter).run(editor, {
                      message: 'Describe the breaking changes:'
                    })
                  }
                }
              ])
          }
        ],
        {
          rendererOptions: { collapseSubtasks: false },
          fallbackRendererCondition: false,
          ctx: {
            prompts: {}
          }
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

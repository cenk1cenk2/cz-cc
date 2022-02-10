import { Prompt } from 'enquirer'
import { Editor as ExternalEditor } from 'external-editor'

export class Editor extends Prompt {
  constructor (options = {}) {
    super(options)
    this.value = this.state.initial || ''
  }

  async suffix (addon = '') {
    const suffix = this.state.cancelled ? ' — Aborted' : this.state.submitted ? ' — Received' : ' — Press <Enter> to launch ' + addon

    return this.styles.dim(suffix)
  }

  // Intercept submit and launch the editor
  async submit () {
    this.value = ExternalEditor.edit(this.value)

    return super.submit()
  }

  async render () {
    const prefix = (await this.prefix()) + ' '
    const message = await this.message()
    const error = await this.error()
    const suffix = error ? await this.suffix('the editor again') : await this.suffix('an editor')

    this.clear(this.state.size)
    this.cursorHide()

    this.write(this.style.bold(prefix) + message + suffix)

    if (error) {
      this.write('\n' + error.split('\n').join(''))
    }
  }
}

'use babel'

import vm from 'vm'
import R from 'ramda'
import RamdaReplView from './ramda-repl-view'
import {CompositeDisposable} from 'atom'
const babel = require('babel-core')
const es2015 = require('babel-preset-es2015')
const stage0 = require('babel-preset-stage-0')

export default {

  ramdaReplView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.ramdaReplView = new RamdaReplView(state.ramdaReplViewState)
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.ramdaReplView.getElement(),
      visible: false
    })

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'ramda-repl:toggle': () => this.toggle()
    }))
  },

  deactivate() {
    this.modalPanel.destroy()
    this.subscriptions.dispose()
    this.ramdaReplView.destroy()
  },

  serialize() {
    return {
      ramdaReplViewState: this.ramdaReplView.serialize()
    }
  },

  toggle() {
    const editor = atom.workspace.getActiveTextEditor()
    const ramdaStr = `var {${R.keys(R).join(',')}} = R;`
    const code = editor.getText()
    const source = `${ramdaStr}\n${code}`

    try {
      const es5 = babel.transform(source, {
        filename: 'ramda-repl',
        presets: [
          es2015,
          stage0,
        ],
      })

      const output = vm.runInContext(es5.code, vm.createContext({R}))

      /**
       * NOTE: THIS PART HERE NEEDS TO DISPLAY RESULT IN PANEL, rather than console.
       */
      console.log(output)
    }
    catch (err) {
      // AND THIS
      console.log(
        err.message.replace(ramdaStr, '').replace(/(?=\d).*(?=\|)/g,
        a => Number(a.trim()) - 1)
      )
    }
  }
}

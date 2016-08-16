'use babel'

import vm from 'vm';
import R from 'ramda';
import RamdaReplView from './ramda-repl-view';

import {
    CompositeDisposable
} from 'atom';

const babel = require('babel-core');
const es2015 = require('babel-preset-es2015');
const stage0 = require('babel-preset-stage-0');

export default {

    textEditor: null,
    panel: null,
    subscriptions: null,
    changeEvents: null,

    activate() {
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'ramda-repl:toggle': () => this.toggle()
        }))
    },

    deactivate() {
        this.subscriptions.dispose();
        this.quitRepl();
    },

    serialize() {},

    toggle() {
        if (this.panel !== null) {
            return this.quitRepl();
        }

        const ramdaStr = `var {${R.keys(R).join(',')}} = R;`;
        const view = new RamdaReplView();
        const textEditor = atom.workspace.getActiveTextEditor();

        this.panel = atom.workspace.addBottomPanel({item: view});


        this.textChange = textEditor.onDidStopChanging(() => {
            const code = textEditor.getText();
            const source = `${ramdaStr};\n${code};`;

            try {
                const es5 = babel.transform(source, {
                    filename: 'ramda-repl',
                    presets: [
                        es2015,
                        stage0,
                    ],
                });

                const output = vm.runInContext(es5.code, vm.createContext({R}));

                /**
                 * NOTE: THIS PART HERE NEEDS TO DISPLAY RESULT IN PANEL, rather than console.
                 */
                view.update(output);
            } catch (err) {
                // AND THIS
                view.update(
                    err.message.replace(ramdaStr, '').replace(/(?=\d).*(?=\|)/g,
                        a => Number(a.trim()) - 1)
                );
            }
        });
    },

    quitRepl() {
        this.panel.destroy();
        this.panel = null;
        this.textChange.dispose();
    }
}

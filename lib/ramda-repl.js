'use babel';

import vm from 'vm';
import R from 'ramda';
import RamdaReplView from './ramda-repl-view';

import { CompositeDisposable } from 'atom';

const babel = require('babel-core');
const es2015 = require('babel-preset-es2015');
const stage0 = require('babel-preset-stage-0');

const ramdaStr = `var {${R.keys(R).join(',')}} = R;`;

export default {
    changeEvents: null,
    panel: null,
    subscriptions: null,
    textEditor: null,

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

        const view = new RamdaReplView();
        const textEditor = atom.workspace.getActiveTextEditor();

        this.panel = atom.workspace.addBottomPanel({item: view});

        this.textChange = textEditor.onDidStopChanging(evaluateBuffer);

        evaluateBuffer();

        function evaluateBuffer() {
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

                view.update(output);

            } catch (err) {
                view.update(
                    err.message.replace(ramdaStr, '').replace(/(?=\d).*(?=\|)/g,
                        a => Number(a.trim()) - 1)
                );
            }
        }
    },

    quitRepl() {
        this.panel.destroy();
        this.panel = null;
        this.textChange.dispose();
    }
}

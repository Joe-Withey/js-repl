'use babel';

export default class RamdaReplView {

  constructor() {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('ramda-repl-container');

    // Create message element
    this.code = document.createElement('pre');
    this.code.classList.add('ramda-repl-code');
    this.element.appendChild(this.code);
  }

  update(input) {
    this.code.innerHTML = input === "use strict" ? "" : JSON.stringify(input);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}

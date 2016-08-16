'use babel'

export default class RamdaReplView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div')
    this.element.classList.add('ramda-repl')

    // Create message element
    const message = document.createElement('div')
    message.textContent = 'The RamdaRepl package is Alive! It\'s ALIVE!'
    this.element.appendChild(message)
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove()
  }

  getElement() {
    return this.element
  }

}

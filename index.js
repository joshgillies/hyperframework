const hyperHTML = require('viperhtml')

module.exports = function mount (component, node) {
  const instance = component.render === undefined ? component() : component
  const render = hyperHTML.bind(node)
  const update = instance.render

  return function app () {
    render`${update.apply(instance, arguments)}`
  }
}

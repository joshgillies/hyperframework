# hyperframework

[![Build Status][0]][1]
[![Standard - JavaScript Style Guide][2]][3]

> Fast and light frontend framework, backed by [hyperHTML][hyper] :zap:

## Usage

### Basic

```js
const component = require('hyperframework/component')
const mount = require('hyperframework')

const Button = component((html, text) => html`
  <button>
    ${text}
  </button>
`)

const App = component((html, data) => html`
  <section>${
    data.map(Button)
  }</section>
`)

const app = mount(App, document.body)
app(['Hello World', 'Hello There'])

setTimeout(app, 1000, ['Hello World', 'Hello There', 'Hello Again'])
```

## License

MIT

[0]: https://travis-ci.org/joshgillies/hyperframework.svg?branch=master
[1]: https://travis-ci.org/joshgillies/hyperframework
[2]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[3]: http://standardjs.com/
[hyper]: https://github.com/WebReflection/hyperHTML

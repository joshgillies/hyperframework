const createComponent = require('hypercomponent')
const slice = Array.prototype.slice

module.exports = function hyper (component) {
  if (
    (typeof component === 'object' && typeof component.render === 'function') ||
    (typeof component === 'function' && component.name !== 'wireComponent')
  ) return hyper(createComponent(component))

  return function componentProxy () {
    const instance = component.apply(null, arguments)
    const wire = instance._wire

    instance._cache = []

    function hyperWire () {
      return hyperWire.html.apply(instance, arguments)
    }

    hyperWire.html = bindWire.call(instance, wire.html)
    hyperWire.svg = bindWire.call(instance, wire.svg)

    instance._wire = hyperWire

    return instance
  }
}

function bindWire (wire) {
  const self = this
  const cache = self._cache

  return function wireProxy () {
    const args = slice.call(arguments)

    for (let
      arrLen, arrCache, arg, cacheLen, symbol,
      length = args.length,
      i = 1; // ignore statics as first arg
      i < length; i++
    ) {
      arg = args[i]
      if (arg === undefined) continue
      if (Array.isArray(arg)) {
        // bail if Array doesn't contain hypercomponents
        if (arg[0] && arg[0]._symbol === undefined) continue
        // check if cache is initialised
        // first position reserved for caching Array args
        if (cache[i] === undefined) cache[i] = [[]]
        arrCache = cache[i][0]
        arrLen = arg.length
        cacheLen = arrCache.length
        // compare cache vs incoming length, and update accordingly
        if (cacheLen > arrLen) arrCache.splice(arrLen)
        if (cacheLen < arrLen) cache[i][0] = arrCache = arrCache.concat(arg.slice(cacheLen))
        args[i] = renderArrayComponentsFromCache(arg, arrCache)
        continue
      }
      symbol = arg._symbol
      // test if arg is a hypercomponent
      if (symbol !== undefined) {
        // check if cache is initialised
        // first position reserved for caching Array args
        if (cache[i] === undefined) cache[i] = [[]]
        args[i] = renderComponent(arg, cache[i], symbol)
      }
    }

    // apply bound wire with updated args
    return wire.apply(self, args)
  }
}

function renderArrayComponentsFromCache (arr, cache) {
  let renderedComponents = []

  for (let
    args, cached, incomming,
    length = cache.length,
    i = 0;
    i < length; i++
  ) {
    cached = cache[i]
    incomming = arr[i]
    args = arr[i]._defaultArgs
    // cached component differs from incoming component; assign incoming
    if (cached._symbol !== incomming._symbol) cache[i] = cached = incomming
    // assign args to cache - used to cache previously rendered args
    if (args !== cached._defaultArgs) cached._defaultArgs = args
    renderedComponents[i] = cached.render.apply(cached, args)
  }

  return renderedComponents
}

function renderComponent (arg, cache, symbol) {
  const proxyArgs = arg._defaultArgs
  // find hypercomponent in cache
  let component
  for (let
    length = cache.length,
    i = 1; // first item in cached reserved for Array args
    i < length; i++
  ) {
    if (cache[i]._symbol === symbol) {
      component = cache[i] // gotcha!
      break
    }
  }
  // previous component exists use it
  if (component !== undefined) arg = component
  // push new component into cache
  else cache.push(arg)
  // return rendered component by passing args from Component to Component.render
  return arg.render.apply(arg, proxyArgs)
}

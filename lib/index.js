// interpreter

var validate = require('./validate')

var Scope = require('./scope')
var typecheck = require('./typecheck')
var ev = require('./evaluate')
var evaluate = ev.evaluate
var evaluateFunction = ev.evaluateFunction

module.exports = function(script) {
  var validation = validate(script)

  if (!validation.value) {
    return validation
  }

  var typeScope = new Scope()
  var type = typecheck(typeScope, script)

  if (!type.hasOwnProperty('value')) {
    return type
  }

  return function(args) {
    var scope = new Scope()
    return evaluateFunction(scope, script, args)
  }
}

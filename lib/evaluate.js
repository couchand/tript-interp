var Scope = require('./scope')

function evaluateLogical(scope, expression) {
  var errors = []
  var children = expression.children
  var accum = expression._type === 'And'

  for (var i = 0, e = children.length; i < e; i += 1) {
    var child = evaluate(scope, children[i])

    if (!child.hasOwnProperty('value')) {
      if (child.error) {
        errors = errors.concat([child.error])
      }
      else if (child.errors) {
        errors = errors.concat(child.errors)
      }
      else {
        throw new Error('Unknown child shape: ' + JSON.stringify(child))
      }
      continue
    }

    if (child.type !== 'Boolean') {
      errors = errors.concat(
        expression._type + ' children must be Boolean type'
      )
    }

    switch (expression._type) {
      case 'And':
        accum = accum && child.value
        break
      case 'Or':
        accum = accum || child.value
        break
      default:
        return { error: 'Unknown operator: ' + expression._type }
    }
  }

  if (errors.length) {
    return {
      errors: errors
    }
  }

  return {
    type: 'Boolean',
    value: accum
  }
}

function evaluateFunction(scope, expression, args) {
  var childScope = new Scope(scope)
  var params = expression.parameters

  for (var i = 0, e = params.length; i < e; i += 1) {
    var parameter = params[i]
    var argument = args[i]

    childScope.put(parameter.name, argument)
  }

  return evaluate(childScope, expression.body)
}

function evaluate(scope, expression) {
  switch (expression._type) {
    case 'LiteralBoolean':
      return {
        type: 'Boolean',
        value: expression.value
      }

    case 'Reference':
      var val = scope.get(expression.name)
      return val.value ? val.value : val

    case 'And':
      return evaluateLogical(scope, expression)

    case 'Or':
      return evaluateLogical(scope, expression)

    case 'Function':
      throw new Error('need arguments to function')

    default:
      throw new Error('Unknown node type "' + expression._type + '"')
  }
}

module.exports = {
  evaluate: evaluate,
  evaluateFunction: evaluateFunction
}

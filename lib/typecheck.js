var Scope = require('./scope')

function typecheckBinary(scope, expression, childType, returnType) {
  var errors = []
  var children = expression.children

  for (var i = 0, e = children.length; i < e; i += 1) {
    var child = typecheck(scope, children[i])

    if (!child.value) {
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

    if (child.value !== childType) {
      return {
        error: expression._type + ' children must be ' + childType + ' type'
      }
    }
  }

  if (errors.length) {
    return {
      errors: errors
    }
  }

  return {
    value: returnType || childType
  }
}

function typecheckFunction(scope, expression) {
  var childScope = new Scope(scope)
  var parameters = expression.parameters

  for (var i = 0, e = parameters.length; i < e; i += 1) {
    var parameter = parameters[i]

    childScope.put(parameter.name, parameter.type)
  }

  return typecheck(childScope, expression.body)
}

function typecheck(scope, expression) {
  switch (expression._type) {
    case 'LiteralBoolean':
      return {
        value: 'Boolean'
      }

    case 'LiteralNumber':
      return {
        value: 'Number'
      }

    case 'Reference':
      return scope.get(expression.name)

    case 'And':
      return typecheckBinary(scope, expression, 'Boolean')

    case 'Or':
      return typecheckBinary(scope, expression, 'Boolean')

    case 'Sum':
      return typecheckBinary(scope, expression, 'Number')

    case 'Equal':
      return typecheckBinary(scope, expression, 'Number', 'Boolean')

    case 'Function':
      return typecheckFunction(scope, expression)

    default:
      throw new Error('Unknown node type "' + expression._type + '"')
  }
}

module.exports = typecheck

function Scope(parent) {
  this.parent = parent
  this.identifiers = {}
}

Scope.prototype.get = function(identifier) {
  if (!this.identifiers.hasOwnProperty(identifier)) {
    if (this.parent) {
      return this.parent.get(identifier)
    }

    return {
      error: '"' + identifier + '" not found'
    }
  }

  return {
    value: this.identifiers[identifier]
  }
}

Scope.prototype.put = function(identifier, value) {
  this.identifiers[identifier] = value
}

module.exports = Scope

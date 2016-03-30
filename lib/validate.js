var schema = require('tript-schema')
var ZSchema = require('z-schema')

module.exports = function(script) {
  var validator = new ZSchema()

  if (!validator.validate(script, schema)) {
    return {
      errors: validator.getLastErrors()
    }
  }

  return {
    value: true
  }
}

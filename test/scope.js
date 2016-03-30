var chai = require('chai')
chai.should()
var expect = chai.expect

var Scope = require('../lib/scope')

describe('scope', function() {
  describe('constuctor', function() {
    it('is a function', function() {
      Scope.should.be.a('function')
    })

    it('makes a new scope', function() {
      var scope = new Scope

      scope.should.be.an.instanceOf(Scope)
    })
  })

  describe('top-level', function() {
    var scope
    
    beforeEach(function() {
      scope = new Scope
    })

    it('returns an error for a missing identifier', function() {
      var result = scope.get('foo')

      expect(result).to.be.an('object')

      result.should.have.property('error')
        .that.matches(/not found/)
        .and.matches(/"foo"/)
    })

    it('returns the value for a found identifier', function (){
      var testValue = 'some test value'
      scope.put('foo', testValue)

      var result = scope.get('foo')

      result.should.have.property('value')
        .that.equals(testValue)
    })
  })

  describe('child', function() {
    var parent, scope
    
    beforeEach(function() {
      parent = new Scope
      scope = new Scope(parent)
    })

    it('returns an error when not found anywhere', function() {
      var result = scope.get('foo')

      expect(result).to.be.an('object')

      result.should.have.property('error')
        .that.matches(/not found/)
        .and.matches(/"foo"/)
    })

    it('returns the value when found in the scope', function (){
      var testValue = 'some test value'
      scope.put('foo', testValue)

      var result = scope.get('foo')

      result.should.have.property('value')
        .that.equals(testValue)
    })

    it('returns the value when found in the parent', function (){
      var testValue = 'some test value'
      parent.put('foo', testValue)

      var result = scope.get('foo')

      result.should.have.property('value')
        .that.equals(testValue)
    })
  })
})

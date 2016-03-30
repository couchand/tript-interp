var chai = require('chai')
chai.should()
var expect = chai.expect

var ast = require('tript-ast').default

var interp = require('..')

describe('interp', function() {
  // TODO: implement
  describe('expression', function() {
    it('interprets the expression')//, function() {
  //    var result = interp(
  //      new ast.LiteralBoolean({
  //        value: true
  //      })
  //    )

  //    expect(result).to.be.an('object')

  //    result.should.have.property('type')
  //      .that.equals('Boolean')
  //    result.should.have.property('value')
  //      .that.equals(true)
  //  })
  })

  describe('Function', function() {
    it('returns a function to interpret', function() {
      var fn = interp(
        new ast.Function({
          name: 'foobar',
          parameters: [
            new ast.Parameter({
              name: 'baz',
              type: 'Boolean'
            })
          ],
          body: new ast.Reference({
            name: 'baz'
          })
        })
      )

      expect(fn).to.be.a('function')

      var result = fn([
        {
            type: 'Boolean',
            value: true
        }
      ])

      expect(result).to.be.an('object')
      result.should.have.property('type')
        .that.equals('Boolean')
      result.should.have.property('value')
        .that.equals(true)
    })
  })
})

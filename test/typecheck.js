var chai = require('chai')
chai.should()
var expect = chai.expect

var ast = require('tript-ast').default
var Scope = require('../lib/scope')

var typecheck = require('../lib/typecheck')

describe('typecheck', function() {
  it('is a function', function() {
    typecheck.should.be.a('function')
  })

  it('throws on invalid nodes', function() {
    (function() {
      typecheck(
        new Scope(),
        {
          _type: 'foobar'
        }
      )
    }).should.throw(/node type/)
  })

  describe('literal', function() {
    describe('LiteralBoolean', function() {
      it('returns type Boolean', function() {
        var typeScope = new Scope()

        var result = typecheck(
          typeScope,
          new ast.LiteralBoolean({
            value: false
          })
        )

        expect(result).to.be.an('object')
        result.should.have.property('value')
          .that.equals('Boolean')
      })
    })
  })

  describe('Reference', function() {
    it('returns the type when found in local scope', function() {
      var typeScope = new Scope()
      typeScope.put('foobar', 'Number')

      var result = typecheck(
        typeScope,
        new ast.Reference({
          name: 'foobar'
        })
      )

      expect(result).to.be.an('object')
      result.should.have.property('value')
      result.value.should.equal('Number')
    })

    it('returns the type when found in parent scope', function() {
      var parentScope = new Scope()
      parentScope.put('foobar', 'Number')
      var typeScope = new Scope(parentScope)

      var result = typecheck(
        typeScope,
        new ast.Reference({
          name: 'foobar'
        })
      )

      expect(result).to.be.an('object')
      result.should.have.property('value')
      result.value.should.equal('Number')
    })

    it('expects the identifier to be in scope', function() {
      var typeScope = new Scope()

      var result = typecheck(
        typeScope,
        new ast.Reference({
          name: 'foobar'
        })
      )

      expect(result).to.be.an('object')
      result.should.have.property('error')
      result.error.should.match(/not found/)
    })
  })

  describe('logical expression', function() {
    describe('And', function() {
      it('expects children to be Boolean type', function() {
        var typeScope = new Scope()
        typeScope.put('foobar', 'Number')

        var result = typecheck(
          typeScope,
          new ast.And({
            children: [
              new ast.Reference({
                name: 'foobar'
              })
            ]
          })
        )

        expect(result).to.be.an('object')
        result.should.have.property('error')

        result.error.should.match(/children/)
          .and.match(/Boolean/)
      })

      it('has Boolean type with no children', function() {
        var typeScope = new Scope()

        var result = typecheck(
          typeScope,
          new ast.And({
            children: []
          })
        )

        expect(result).to.be.an('object')
        result.should.have.property('value')
          .that.equals('Boolean')
      })

      it('has Boolean type with Boolean children', function() {
        var typeScope = new Scope()

        var result = typecheck(
          typeScope,
          new ast.And({
            children: [
              new ast.LiteralBoolean({
                value: true
              })
            ]
          })
        )

        expect(result).to.be.an('object')
        result.should.have.property('value')
          .that.equals('Boolean')
      })
    })

    describe('Or', function() {
      it('expects children to be Boolean type', function() {
        var typeScope = new Scope()
        typeScope.put('foobar', 'Number')

        var result = typecheck(
          typeScope,
          new ast.Or({
            children: [
              new ast.Reference({
                name: 'foobar'
              })
            ]
          })
        )

        expect(result).to.be.an('object')
        result.should.have.property('error')

        result.error.should.match(/children/)
          .and.match(/Boolean/)
      })

      it('has Boolean type with no children', function() {
        var typeScope = new Scope()

        var result = typecheck(
          typeScope,
          new ast.Or({
            children: []
          })
        )

        expect(result).to.be.an('object')
        result.should.have.property('value')
          .that.equals('Boolean')
      })

      it('has Boolean type with Boolean children', function() {
        var typeScope = new Scope()

        var result = typecheck(
          typeScope,
          new ast.Or({
            children: [
              new ast.LiteralBoolean({
                value: true
              })
            ]
          })
        )

        expect(result).to.be.an('object')
        result.should.have.property('value')
          .that.equals('Boolean')
      })
    })
  })

  describe('Function', function() {
    it('has the type of the body', function() {
      var typeScope = new Scope()

      var result = typecheck(
        typeScope,
        new ast.Function({
          name: 'foobar',
          parameters: [],
          body: new ast.LiteralBoolean({
            value: false
          })
        })
      )

      expect(result).to.be.an('object')
      result.should.have.property('value')
        .that.equals('Boolean')
    })

    it('puts parameter types in child scope', function() {
      var typeScope = new Scope()

      var result = typecheck(
        typeScope,
        new ast.Function({
          name: 'foobar',
          parameters: [
            new ast.Parameter({
              name: 'baz',
              type: 'SomeType'
            })
          ],
          body: new ast.Reference({
            name: 'baz'
          })
        })
      )

      expect(result).to.be.an('object')
      result.should.have.property('value')
        .that.equals('SomeType')

      typeScope.get('baz').should.have.property('error')
    })
  })

  it('passes child errors up', function() {
    var typeScope = new Scope()

    var result = typecheck(
      typeScope,
      new ast.And({
        children: [
          new ast.Reference({
            name: 'foobar'
          })
        ]
      })
    )

    expect(result).to.be.an('object')
    result.should.have.property('errors')
    result.errors.should.have.lengthOf(1)
    result.errors[0].should.match(/not found/)
  })
})

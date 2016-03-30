var chai = require('chai')
chai.should()
var expect = chai.expect

var ast = require('tript-ast').default
var Scope = require('../lib/scope')

var ev = require('../lib/evaluate')
var evaluate = ev.evaluate
var evaluateFunction = ev.evaluateFunction

describe('evaluate', function() {
  it('is a function', function() {
    evaluate.should.be.a('function')
  })

  it('throws on invalid nodes', function() {
    (function() {
      evaluate(
        new Scope(),
        {
          _type: 'foobar'
        }
      )
    }).should.throw(/node type/)
  })

  describe('literal', function() {
    describe('LiteralBoolean', function() {
      it('returns a Boolean', function() {
        var scope = new Scope()

        var result = evaluate(
          scope,
          new ast.LiteralBoolean({
            value: false
          })
        )

        expect(result).to.be.an('object')
        result.should.have.property('type')
          .that.equals('Boolean')
        result.should.have.property('value')
          .that.equals(false)
      })
    })
  })

  describe('Reference', function() {
    it('returns the value when found in local scope', function() {
      var scope = new Scope()
      scope.put('foobar', { type: 'Number', value: 42 })

      var result = evaluate(
        scope,
        new ast.Reference({
          name: 'foobar'
        })
      )

      expect(result).to.be.an('object')
      result.should.have.property('type')
        .that.equals('Number')
      result.should.have.property('value')
        .that.equals(42)
    })

    it('returns the value when found in parent scope', function() {
      var parentScope = new Scope()
      parentScope.put('foobar', { type: 'Number', value: 42 })
      var scope = new Scope(parentScope)

      var result = evaluate(
        scope,
        new ast.Reference({
          name: 'foobar'
        })
      )

      expect(result).to.be.an('object')
      result.should.have.property('type')
        .that.equals('Number')
      result.should.have.property('value')
        .that.equals(42)
    })

    it('expects the identifier to be in scope', function() {
      var scope = new Scope()

      var result = evaluate(
        scope,
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
    function makeLogical(op, literals) {
      return new ast[op]({
        children: literals.map((literal) =>
          new ast.LiteralBoolean({
            value: literal
          })
        )
      })
    }

    describe('And', function() {
      it('is true for empty children', function() {
        var scope = new Scope()

        var result = evaluate(
          scope,
          makeLogical('And', [])
        )

        expect(result).to.be.an('object')
        result.should.have.property('type')
          .that.equals('Boolean')
        result.should.have.property('value')
          .that.equals(true)
      }),

      it('is true when all children are true', function() {
        var scope = new Scope()

        var result = evaluate(
          scope,
          makeLogical('And', [true, true, true])
        )

        expect(result).to.be.an('object')
        result.should.have.property('type')
          .that.equals('Boolean')
        result.should.have.property('value')
          .that.equals(true)
      })

      it('is false when any child is false', function() {
        var scope = new Scope()

        var result = evaluate(
          scope,
          makeLogical('And', [true, true, false])
        )

        expect(result).to.be.an('object')
        result.should.have.property('type')
          .that.equals('Boolean')
        result.should.have.property('value')
          .that.equals(false)
      })

      it('expects children to be Boolean', function() {
        var scope = new Scope()
        scope.put('foobar', { type: 'Number', value: 42 })

        var result = evaluate(
          scope,
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
          .that.has.lengthOf(1)
        result.errors[0].should.match(/children/)
      })
    })

    describe('Or', function() {
      it('is false for empty children', function() {
        var scope = new Scope()

        var result = evaluate(
          scope,
          makeLogical('Or', [])
        )

        expect(result).to.be.an('object')
        result.should.have.property('type')
          .that.equals('Boolean')
        result.should.have.property('value')
          .that.equals(false)
      }),

      it('is false when all children are false', function() {
        var scope = new Scope()

        var result = evaluate(
          scope,
          makeLogical('Or', [false, false, false])
        )

        expect(result).to.be.an('object')
        result.should.have.property('type')
          .that.equals('Boolean')
        result.should.have.property('value')
          .that.equals(false)
      })

      it('is true when any child is true', function() {
        var scope = new Scope()

        var result = evaluate(
          scope,
          makeLogical('Or', [false, false, true])
        )

        expect(result).to.be.an('object')
        result.should.have.property('type')
          .that.equals('Boolean')
        result.should.have.property('value')
          .that.equals(true)
      })

      it('expects children to be Boolean', function() {
        var scope = new Scope()
        scope.put('foobar', { type: 'Number', value: 42 })

        var result = evaluate(
          scope,
          new ast.Or({
            children: [
              new ast.Reference({
                name: 'foobar'
              })
            ]
          })
        )

        expect(result).to.be.an('object')
        result.should.have.property('errors')
          .that.has.lengthOf(1)
        result.errors[0].should.match(/children/)
      })
    })
  })

  it('passes child errors up', function() {
    var scope = new Scope()

    var result = evaluate(
      scope,
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

describe('evaluateFunction', function() {
  describe('Function', function() {
    it('returns the value of the body', function() {
      var scope = new Scope()

      var result = evaluateFunction(
        scope,
        new ast.Function({
          name: 'foobar',
          parameters: [],
          body: new ast.LiteralBoolean({
            value: false
          })
        })
      )

      expect(result).to.be.an('object')
      result.should.have.property('type')
        .that.equals('Boolean')
      result.should.have.property('value')
        .that.equals(false)
    })

    it('puts arguments in child scope', function() {
      var scope = new Scope()

      var result = evaluateFunction(
        scope,
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
        }),
        [{
            type: 'Boolean',
            value: true
        }]
      )

      expect(result).to.be.an('object')
      result.should.have.property('type')
        .that.equals('Boolean')
      result.should.have.property('value')
        .that.equals(true)

      scope.get('baz').should.have.property('error')
    })
  })
})

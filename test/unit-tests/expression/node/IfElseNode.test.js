// test IfElseNode
import assert from 'assert'

import math from '../../../../src/bundleAny'
const Node = math.Node
const ConstantNode = math.ConstantNode
const SymbolNode = math.SymbolNode
const AssignmentNode = math.AssignmentNode
const IfElseNode = math.IfElseNode

describe('IfElseNode', function () {
  const ifTrueCondition = new ConstantNode(true)
  const ifFalseCondition = new ConstantNode(false)
  const zero = new ConstantNode(0)
  const one = new ConstantNode(1)
  const two = new ConstantNode(2)
  const three = new ConstantNode(3)
  const a0 = new AssignmentNode(new SymbolNode('a'), zero)
  const a1 = new AssignmentNode(new SymbolNode('a'), one)
  const a2 = new AssignmentNode(new SymbolNode('a'), two)
  const a3 = new AssignmentNode(new SymbolNode('a'), three)

  it('should create a IfElseNode', function () {
    const n = new IfElseNode([ifTrueCondition], [a0])
    assert(n instanceof IfElseNode)
    assert(n instanceof Node)
    assert.strictEqual(n.type, 'IfElseNode')
  })

  it('should have IfElseNode', function () {
    const node = new IfElseNode([ifTrueCondition], [a0])
    assert(node.isIfElseNode)
  })

  it('should throw an error when calling without new operator', function () {
    assert.throws(function () { IfElseNode() }, SyntaxError)
  })

  it('should throw an error when creating without arguments', function () {
    assert.throws(function () { console.log(new IfElseNode()) }, TypeError)
    assert.throws(function () { console.log(new IfElseNode([ifTrueCondition])) }, TypeError)
    assert.throws(function () { console.log(new IfElseNode([ifTrueCondition], null)) }, TypeError)
    assert.throws(function () { console.log(new IfElseNode(null, [a0])) }, TypeError)
  })

  it('should throw an error when creating with conditions array length is larger than blocks array', function () {
    assert.throws(function () { console.log(new IfElseNode([ifTrueCondition, ifFalseCondition], [a0])) }, Error)
  })

  it('should throw an error when creating with conditions array length is less than blocks array by more than one', function () {
    assert.throws(function () { console.log(new IfElseNode([ifTrueCondition], [a0, a1, a2])) }, Error)
  })

  it('should lazy evaluate a IfElseNode', function () {
    let n = new IfElseNode([ifTrueCondition], [a0])
    let expr = n.compile()
    let scope = {}
    assert.strictEqual(expr.evaluate(scope), 0)
    assert.deepStrictEqual(scope, { a: 0 })

    n = new IfElseNode([ifFalseCondition, ifFalseCondition, ifTrueCondition], [a0, a1, a2])
    expr = n.compile()
    scope = {}
    assert.strictEqual(expr.evaluate(scope), 2)
    assert.deepStrictEqual(scope, { a: 2 })
    
    n = new IfElseNode([ifFalseCondition, ifFalseCondition], [a0, a1, a3])
    expr = n.compile()
    scope = {}
    assert.strictEqual(expr.evaluate(scope), 3)
    assert.deepStrictEqual(scope, { a: 3 })
  })
})

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

  describe('evaluate', function () {
    it('should evaluate single if condition', function () {
      let ifElse = new IfElseNode([ifTrueCondition], [a1])
      assert.strictEqual(ifElse.compile().evaluate(), 1)

      ifElse = new IfElseNode([ifFalseCondition], [a1])
      assert.strictEqual(ifElse.compile().evaluate(), undefined)
    })

    it('should evaluate if and else conditions', function () {
      let ifElse = new IfElseNode([ifTrueCondition], [a1, a2])
      assert.strictEqual(ifElse.compile().evaluate(), 1)

      ifElse = new IfElseNode([ifFalseCondition], [a1, a2])
      assert.strictEqual(ifElse.compile().evaluate(), 2)
    })

    it('should evaluate if and else if conditions', function () {
      let ifElse = new IfElseNode([ifTrueCondition, ifTrueCondition], [a1, a2])
      assert.strictEqual(ifElse.compile().evaluate(), 1)

      ifElse = new IfElseNode([ifFalseCondition, ifTrueCondition], [a1, a2])
      assert.strictEqual(ifElse.compile().evaluate(), 2)

      ifElse = new IfElseNode([ifFalseCondition, ifFalseCondition], [a1, a2])
      assert.strictEqual(ifElse.compile().evaluate(), undefined)
    })

    it('should evaluate if, else if, and else conditions', function () {
      let ifElse = new IfElseNode([ifTrueCondition, ifTrueCondition], [a1, a2, a3])
      assert.strictEqual(ifElse.compile().evaluate(), 1)

      ifElse = new IfElseNode([ifFalseCondition, ifTrueCondition], [a1, a2, a3])
      assert.strictEqual(ifElse.compile().evaluate(), 2)

      ifElse = new IfElseNode([ifFalseCondition, ifFalseCondition], [a1, a2, a3])
      assert.strictEqual(ifElse.compile().evaluate(), 3)
    })

    it('should evaluate if, multiple else if, and else conditions', function () {
      let ifElse = new IfElseNode([ifTrueCondition, ifTrueCondition, ifTrueCondition], [a1, a2, a3, a0])
      assert.strictEqual(ifElse.compile().evaluate(), 1)

      ifElse = new IfElseNode([ifFalseCondition, ifTrueCondition, ifTrueCondition], [a1, a2, a3, a0])
      assert.strictEqual(ifElse.compile().evaluate(), 2)

      ifElse = new IfElseNode([ifFalseCondition, ifFalseCondition, ifTrueCondition], [a1, a2, a3, a0])
      assert.strictEqual(ifElse.compile().evaluate(), 3)

      ifElse = new IfElseNode([ifFalseCondition, ifFalseCondition, ifFalseCondition], [a1, a2, a3, a0])
      assert.strictEqual(ifElse.compile().evaluate(), 0)
    })

    it('should evaluate if, and multiple else if conditions', function () {
      let ifElse = new IfElseNode([ifTrueCondition, ifTrueCondition, ifTrueCondition, ifTrueCondition], [a1, a2, a3, a0])
      assert.strictEqual(ifElse.compile().evaluate(), 1)

      ifElse = new IfElseNode([ifFalseCondition, ifTrueCondition, ifTrueCondition, ifTrueCondition], [a1, a2, a3, a0])
      assert.strictEqual(ifElse.compile().evaluate(), 2)

      ifElse = new IfElseNode([ifFalseCondition, ifFalseCondition, ifTrueCondition, ifTrueCondition], [a1, a2, a3, a0])
      assert.strictEqual(ifElse.compile().evaluate(), 3)

      ifElse = new IfElseNode([ifFalseCondition, ifFalseCondition, ifFalseCondition, ifTrueCondition], [a1, a2, a3, a0])
      assert.strictEqual(ifElse.compile().evaluate(), 0)

      ifElse = new IfElseNode([ifFalseCondition, ifFalseCondition, ifFalseCondition, ifFalseCondition], [a1, a2, a3, a0])
      assert.strictEqual(ifElse.compile().evaluate(), undefined)
    })
  })

  it('should filter a IfElseNode', function () {
    const n = new IfElseNode([ifTrueCondition], [a0])

    assert.deepStrictEqual(n.filter(function (node) { return node instanceof IfElseNode }), [n])
    assert.deepStrictEqual(n.filter(function (node) { return node instanceof AssignmentNode }), [a0])
    assert.deepStrictEqual(n.filter(function (node) { return node instanceof ConstantNode && node.value === 0 }), [zero])
  })

  it('should run forEach on a IfElseNode', function () {
    const n = new IfElseNode([ifTrueCondition, ifTrueCondition], [a1, a2, a3])

    const nodes = []
    const paths = []
    n.forEach(function (node, path, parent) {
      nodes.push(node)
      paths.push(path)
      assert.strictEqual(parent, n)
    })

    assert.strictEqual(nodes.length, 5)
    assert.strictEqual(nodes[0], ifTrueCondition)
    assert.strictEqual(nodes[1], a1)
    assert.strictEqual(nodes[2], ifTrueCondition)
    assert.strictEqual(nodes[3], a2)
    assert.strictEqual(nodes[4], a3)
  })

  it('should map a IfElseNode', function () {
    const n = new IfElseNode([ifTrueCondition, ifTrueCondition], [a1, a1, a1])
    const nodes = []
    const paths = []
    const e = new AssignmentNode(new SymbolNode('a'), new ConstantNode(9))
    
    const f = n.map(function (node, path, parent) {
      nodes.push(node)
      paths.push(path)
      assert.strictEqual(parent, n)

      return node instanceof AssignmentNode ? e : node
    })

    assert.strictEqual(nodes.length, 5)
    assert.strictEqual(nodes[0], ifTrueCondition)
    assert.strictEqual(nodes[1], ifTrueCondition)
    assert.strictEqual(nodes[2], a1)
    assert.strictEqual(nodes[3], a1)
    assert.strictEqual(nodes[4], a1)

    
    assert.notStrictEqual(f, n)
    assert.strictEqual(f.blockNodes[0], e)
    assert.strictEqual(f.blockNodes[1], e)
    assert.strictEqual(f.blockNodes[2], e)
  })

  it('should throw an error when the map callback does not return a node', function () {
    const n = new IfElseNode([ifTrueCondition], [a1, a2])

    assert.throws(function () {
      n.map(function () {})
    }, /Callback function must return a Node/)
  })

  it("should transform IfElseNode conditions", () => {
    const n = new IfElseNode([ifTrueCondition, ifTrueCondition], [a1, a1, a1])
    // new ConstantNode(true)
    const f = n.transform(function (node) {
      return node instanceof ConstantNode && node.value === true
        ? ifFalseCondition
        : node;
    })
    
    assert.notStrictEqual(f, n)
    assert.deepStrictEqual(f.conditions, [ifFalseCondition, ifFalseCondition])
    assert.deepStrictEqual(f.blockNodes, [a1, a1, a1])
  })
  
  it("should transform IfElseNode blocks", () => {
    const n = new IfElseNode([ifTrueCondition, ifTrueCondition], [a1, a1, a1])
    // new ConstantNode(true)
    const f = n.transform(function (node) {
      return node instanceof AssignmentNode && node.value === true
        ? ifFalseCondition
        : node;
    })
    
    assert.notStrictEqual(f, n)
    assert.deepStrictEqual(f.conditions, [ifFalseCondition, ifFalseCondition])
    assert.deepStrictEqual(f.blockNodes, [a1, a1, a1])
  })
})

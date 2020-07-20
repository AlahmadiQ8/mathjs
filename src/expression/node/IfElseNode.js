import { isBigNumber, isComplex, isNode, isUnit, typeOf } from '../../utils/is'
import { factory } from '../../utils/factory'
import { getPrecedence } from '../operators'

const name = 'IfElseNode'
const dependencies = [
  'ResultSet',
  'Node',
  'BlockNode'
]

export const createIfElseNode = /* #__PURE__ */ factory(name, dependencies, ({ ResultSet, Node }) => {
  /**
   *
   * @constructor IfElseNode
   * @extends {Node}
   * @param {Array.<Node>} conditions   An array of conditions for each if condition
   * @param {Array.<Node>} blockNodes   An array of block nodes for each if branch in addition to else branch if exists
   */
  function IfElseNode (conditions, blockNodes) {
    if (!(this instanceof IfElseNode)) {
      throw new SyntaxError('Constructor must be called with the new operator')
    }

    if (!Array.isArray(conditions)) throw new TypeError('Array expected')
    if (!Array.isArray(blockNodes)) throw new TypeError('Array expected')
    if (conditions.length === 0) throw new Error('conditions must not be empty')
    if (blockNodes.length === 0) throw new Error('blockNodes must not be empty')
    if (blockNodes.length !== conditions.length && blockNodes.length - conditions.length !== 1) {
      throw new Error('The length of Parameter conditions array must be equal or less than the length of the parameter blockNodes by at most one')
    }

    this.conditions = conditions.map(function (condition) {
      if (!isNode(condition)) throw new TypeError('Parameter condition must be a Node')
      return condition
    })
    this.blockNodes = blockNodes.map(function (blockNode) {
      if (!isNode(blockNode)) throw new TypeError('Parameter block must be a Node')
      return blockNode
    })
  }

  IfElseNode.prototype = new Node()

  IfElseNode.prototype.type = 'IfElseNode'

  IfElseNode.prototype.isIfElseNode = true

  /**
   * Compile a node into a JavaScript function.
   * This basically pre-calculates as much as possible and only leaves open
   * calculations which depend on a dynamic scope with variables.
   * @param {Object} math     Math.js namespace with functions and constants.
   * @param {Object} argNames An object with argument names as key and `true`
   *                          as value. Used in the SymbolNode to optimize
   *                          for arguments from user assigned functions
   *                          (see FunctionAssignmentNode) or special symbols
   *                          like `end` (see IndexNode).
   * @return {function} Returns a function which can be called like:
   *                        evalNode(scope: Object, args: Object, context: *)
   */
  IfElseNode.prototype._compile = function (math, argNames) {
    const evalConditions = this.conditions.map(function (condition) {
      return condition._compile(math, argNames)
    })
    const evalBlockNodes = this.blockNodes.map(function (blockNode) {
      return blockNode._compile(math, argNames)
    })

    return (scope, args, context) => {
      const trueBlockIndex = evalConditions.findIndex(function (evalCondition) {
        return testCondition(evalCondition(scope, args, context))
      })

      if (trueBlockIndex !== -1) return evalBlockNodes[trueBlockIndex](scope, args, context)

      if (this.blockNodes.length > this.conditions.length) {
        return evalBlockNodes[this.blockNodes.length - 1](scope, args, context)
      }
    }
  }

  /**
   * Execute a callback for each of the child nodes of this node
   * @param {function(child: Node, path: string, parent: Node)} callback
   */
  IfElseNode.prototype.forEach = function (callback) {
    for (let i = 0; i < this.conditions.length; i++) {
      if (i === 0) {
        callback(this.conditions[i], 'ifCondition', this)
        callback(this.blockNodes[i], 'ifBlock')
      } else {
        callback(this.conditions[i], 'elseIfCondition[' + i + ']', this)
        callback(this.blockNodes[i], 'elseIfBlock[' + i + ']', this)
      }
    }
    if (this.blockNodes.length > this.conditions.length) {
      callback(this.blockNodes[this.blockNodes.length - 1], 'elseBlock', this)
    }
  }

  /**
   * Create a new IfElseNode having it's childs be the results of calling
   * the provided callback function for each of the childs of the original node.
   * @param {function(child: Node, path: string, parent: Node): Node} callback
   * @returns {IfElseNode} Returns a transformed copy of the node
   */
  IfElseNode.prototype.map = function (callback) {
    return new IfElseNode(
      this.conditions.map((condition, i) => {
        if (i === 0) {
          return this._ifNode(callback(condition, 'ifCondition', this))
        } else {
          return this._ifNode(callback(condition, 'elseIfCondition[' + i + ']', this))
        }
      }),
      this.blockNodes.map((blockNode, i) => {
        if (i === 0) {
          return this._ifNode(callback(blockNode, 'ifBlock', this))
        } else if (this.blockNodes.length === this.conditions.length || i < this.conditions.length - 1) {
          return this._ifNode(callback(blockNode, 'elseIfBlock[' + i + ']', this))
        } else {
          return this._ifNode(callback(blockNode, 'elseBlock', this))
        }
      })
    )
  }

  /**
   * Create a clone of this node, a shallow copy
   * @return {IfElseNode}
   */
  IfElseNode.prototype.clone = function () {
    return new IfElseNode(this.conditions, this.blockNodes)
  }

  /**
   * Is parenthesis needed?
   * @param {Node} node
   * @param {Object} parenthesis
   * @private
   */
  function needParenthesis (node, parenthesis) {
    const precedence = getPrecedence(node, parenthesis)
    const exprPrecedence = getPrecedence(node.expr, parenthesis)

    return (parenthesis === 'all') ||
      ((exprPrecedence !== null) && (exprPrecedence <= precedence))
  }

  /**
   * Get string representation
   * @param {Object} options
   * @return {string} str
   * @override
   */
  IfElseNode.prototype._toString = function (options) {
    const str = []
    const parenthesis = (options && options.parenthesis) ? options.parenthesis : 'keep'

    const ifCondition = this.conditions[0].toString(options)
    let ifConditionString = 'if ' + ifCondition
    if (needParenthesis(this, parenthesis)) {
      ifConditionString = 'if (' + ifCondition + ')'
    }
    str.push(ifConditionString)

    const ifBlockString = this.blockNodes[0].toString(options).replace(/\n/g, '\n\t')
    str.push(ifBlockString)

    for (let i = 1; i < this.conditions.length; i++) {
      const elseIfCondition = this.conditions[i].toString(options)
      let elseIfConditionString = 'else if ' + elseIfCondition
      if (needParenthesis(this, parenthesis)) {
        elseIfConditionString = 'else if (' + elseIfCondition + ')'
      }
      str.push(elseIfConditionString)

      const elseIfBlockString = this.blockNodes[i].toString(options).replace(/\n/g, '\n\t')
      str.push(elseIfBlockString)
    }

    if (this.blockNodes.length > this.conditions.length) {
      str.push('else')
      const elseBlockString = this.blockNodes[this.blockNodes.length - 1].toString(options).replace(/\n/g, '\n\t')
      str.push(elseBlockString)
    }

    str.push('end')
    return str.join('\n')
  }

  /**
   * Get a JSON representation of the node
   * @returns {Object}
   */
  IfElseNode.prototype.toJSON = function () {
    return {
      mathjs: 'IfElseNode',
      conditions: this.conditions,
      blockNodes: this.blockNodes
    }
  }

  /**
   * Instantiate an IfElseNode from its JSON representation
   * @param {Object} json  An object structured like
   *                       `{"mathjs": "IfElseNode", "condition": ..., "trueExpr": ..., "falseExpr": ...}`,
   *                       where mathjs is optional
   * @returns {IfElseNode}
   */
  IfElseNode.fromJSON = function (json) {
    return new IfElseNode(json.conditions, json.blockNodes)
  }

  /**
   * Get HTML representation
   * @param {Object} options
   * @return {string} str
   */
  IfElseNode.prototype.toHTML = function (options) {
    // TODO: must be implemented
    return ''
  }

  /**
   * get LaTeX representation
   * @param {Object} options
   * @return {string} str
   */
  IfElseNode.prototype._toTex = function (options) {
    // TODO: must be implemented
    return ''
  }

  /**
   * Test whether a condition is met
   * @param {*} condition
   * @returns {boolean} true if condition is true or non-zero, else false
   */
  function testCondition (condition) {
    if (typeof condition === 'number' ||
        typeof condition === 'boolean' ||
        typeof condition === 'string') {
      return !!condition
    }

    if (condition) {
      if (isBigNumber(condition)) {
        return !condition.isZero()
      }

      if (isComplex(condition)) {
        return !!((condition.re || condition.im))
      }

      if (isUnit(condition)) {
        return !!condition.value
      }
    }

    if (condition === null || condition === undefined) {
      return false
    }

    throw new TypeError('Unsupported type of condition "' + typeOf(condition) + '"')
  }

  return IfElseNode
}, { isClass: true, isNode: true })

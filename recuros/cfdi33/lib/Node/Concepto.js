'use strict'

const Node = require('./Node')

class Concepto extends Node {
  /**
   *
   * @returns {string}
   */
  get nodeName () {
    return 'cfdi:Concepto'
  }

  /**
   *
   * @returns {string}
   */
  get parentNodeName () {
    return 'cfdi:Conceptos'
  }

  /**
   *
   * @returns {boolean}
   */
  get multiple () {
    return true;
  }
}

module.exports = Concepto
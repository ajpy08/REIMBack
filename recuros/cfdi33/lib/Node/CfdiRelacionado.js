'use strict'

const Node = require('./Node')

class CfdiRelacionado extends Node {
  /**
   *
   * @returns {string}
   */
  get nodeName () {
    return 'cfdi:CfdiRelacionado'
  }

  /**
   *
   * @returns {string}
   */
  get parentNodeName () {
    return 'cfdi:CfdiRelacionados'
  }

  /**
   *
   * @returns {boolean}
   */
  get multiple () {
    return true;
  }
}

module.exports = CfdiRelacionado
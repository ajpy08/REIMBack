'use strict'

const Node = require('./Node')

class CuentaPredial extends Node {
  /**
   *
   * @returns {string}
   */
  get nodeName () {
    return 'cfdi:CuentaPredial'
  }
}

module.exports = CuentaPredial
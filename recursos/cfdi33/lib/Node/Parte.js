'use strict'

const Node = require('./Node')

class Parte extends Node {
  /**
   *
   * @returns {string}
   */
  get nodeName () {
    return 'cfdi:Parte'
  }

  /**
   *
   * @returns {boolean}
   */
  get multiple () {
    return true;
  }
}

module.exports = Parte
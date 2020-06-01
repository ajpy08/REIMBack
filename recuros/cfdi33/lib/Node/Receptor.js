'use strict'

const Node = require('./Node')

class Receptor extends Node{
  /**
   *
   * @returns {string}
   */
  get nodeName () {
    return 'cfdi:Receptor'
  }
}

module.exports = Receptor
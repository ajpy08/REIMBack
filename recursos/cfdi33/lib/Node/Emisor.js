'use strict'

const Node = require('./Node')

class Emisor extends Node{
  /**
   *
   * @returns {string}
   */
  get nodeName () {
    return 'cfdi:Emisor'
  }
}

module.exports = Emisor
'use strict'

const Node = require('./Node')

class InformacionAduanera extends Node{
  /**
   *
   * @returns {string}
   */
  get nodeName () {
    return 'cfdi:InformacionAduanera'
  }
}

module.exports = InformacionAduanera
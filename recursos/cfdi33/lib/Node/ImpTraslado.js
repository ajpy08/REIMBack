'use strict'

const Node = require('./Node')

class ImpTraslado extends Node{
  /**
   *
   * @returns {string}
   */
  get nodeName () {
    return 'cfdi:Traslado'
  }

  /**
   *
   * @returns {string}
   */
  get parentNodeName () {
    return 'cfdi:Traslados'
  }

  /**
   *
   * @returns {boolean}
   */
  get multiple () {
    return true;
  }
}

module.exports = ImpTraslado

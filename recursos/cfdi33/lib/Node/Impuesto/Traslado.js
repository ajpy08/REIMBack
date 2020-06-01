'use strict'

const Node = require('../Node')

class Traslado extends Node{
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
   * @returns {string}
   */
  get wrapperNodeName () {
    return 'cfdi:Impuestos'
  }

  /**
   *
   * @returns {boolean}
   */
  get multiple () {
    return true;
  }
}

module.exports = Traslado

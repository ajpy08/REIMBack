'use strict'

const Node = require('../Node')

class Retencion extends Node{
  /**
   *
   * @returns {string}
   */
  get nodeName () {
    return 'cfdi:Retencion'
  }

  /**
   *
   * @returns {string}
   */
  get parentNodeName () {
    return 'cfdi:Retenciones'
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

module.exports = Retencion
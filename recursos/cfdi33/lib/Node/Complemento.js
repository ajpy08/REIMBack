'use strict'

const Node = require('./Node')

class Complemento extends Node {
  /**
   *
   * @returns {string}
   */
  get parentNodeName () {
    return 'cfdi:Complemento'
  }

   /**
   *
   * @returns {string}
   */
  get nodeName () {
    return 'tdf:TimbreFiscalDigital'
  }

    /**
   *
   * @returns {boolean}
   */
  get multiple () {
    return true;
  }
}

module.exports = Complemento
'use strict'

const Node = require('./Node')

class Traslado extends Node{
  /**
   *
   * @returns {string}
   */
  get nodeName () {
    return 'cfdi:Impuestos'
  }

  // /**
  //  *
  //  * @returns {string}
  //  */
  // get parentNodeName () {
  //   return 'cfdi:Impuestos'
  // }

  // /**
  //  *
  //  * @returns {string}
  //  */
  // get wrapperNodeName () {
  //   return 'cfdi:Impuestos'
  // }

  /**
   *
   * @returns {boolean}
   */
  get multiple () {
    return true;
  }
}

module.exports = Traslado

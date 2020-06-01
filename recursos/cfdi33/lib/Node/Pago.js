'use strict'

const Node = require('./Node');

class Pago extends Node {

  /**
   *
   * @returns {string}
   */
  get nodeName () {
    return 'pago10:DoctoRelacionado';
  }

  /**
   *
   * @returns {string}
   */
  get parentNodeName () {
    return 'pago10:Pago';
  }

  /**
   *
   * @returns {string}
   */
  get wrapperNodeName () {
    return 'pago10:Pagos';
  }

  /**
   *
   * @returns {boolean}
   */
  get multiple () {
    return true;
  }
}

module.exports = Pago

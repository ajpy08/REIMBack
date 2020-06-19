'use strict'

const Node = require('@alexotano/cfdi33/lib/Node/Node');

class Addenda extends Node {
    /**
     * 
     @return {string}
     * 
     */
    get nodeName() {
        return 'REIM:Adicionales'
    }

    /**
     * 
     @return {string}
     * 
     */
    get parentNodeName() {
        return 'cfdi:Addenda'
    }
    /**
 *
 * @returns {boolean}
 */
    get multiple() {
        return true;
    }
}
module.exports = Addenda
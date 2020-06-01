'use strict'

class Node {

  /**
   *
   * @param attributes
   * @param parentAttributes
   * @param wrapperAttributes
   */
  constructor (attributes = {}, parentAttributes = {}, wrapperAttributes = {}) {
    this.attributes = this._parseAttributes(attributes)
    this.parentAttributes = this._parseAttributes(parentAttributes)
    this.wrapperAttributes = this._parseAttributes(wrapperAttributes)
    this.nodes = []
  }

  /**
   *
   * @returns {null}
   */
  makeAllNodes () {
    this.nodes.forEach(node => {
		try{
			if (node.wrapperNodeName !== null) {
				if (typeof this.attributes[node.wrapperNodeName] === 'undefined') {
					this.attributes[node.wrapperNodeName] = node.getWrapperAttributes();
				}

				this.attributes[node.wrapperNodeName] = Object.assign(this.attributes[node.wrapperNodeName], node.getWrapperAttributes());

				if (typeof this.attributes[node.wrapperNodeName][node.parentNodeName] === 'undefined') {
					this.attributes[node.wrapperNodeName][node.parentNodeName] = node.getParentAttributes()
				}

				this.attributes[node.wrapperNodeName][node.parentNodeName] = Object.assign(this.attributes[node.wrapperNodeName][node.parentNodeName], node.getParentAttributes())

				if (node.multiple) {
					if (typeof this.attributes[node.wrapperNodeName][node.parentNodeName][node.nodeName] === 'undefined') {
						this.attributes[node.wrapperNodeName][node.parentNodeName][node.nodeName] = []
					}
					
					this.attributes[node.wrapperNodeName][node.parentNodeName][node.nodeName].push(node.getAttributes())

				} else {
					this.attributes[node.wrapperNodeName][node.parentNodeName][node.nodeName] = node.getAttributes()
				}
			} else {
				if (node.parentNodeName !== null) {
					if (typeof this.attributes[node.parentNodeName] === 'undefined') {
						this.attributes[node.parentNodeName] = node.getParentAttributes()
					}

					if (node.multiple) {

						if (typeof this.attributes[node.parentNodeName][node.nodeName] === 'undefined') {
							this.attributes[node.parentNodeName][node.nodeName] = [];
						}
						
						this.attributes[node.parentNodeName][node.nodeName].push(node.getAttributes());
					} else {
						this.attributes[node.parentNodeName][node.nodeName] = node.getAttributes();
					}
				} else {
					if (node.nodeName !== null) {
						this.attributes[node.nodeName] = node.getAttributes();
					} else {
						this.attributes[node.constructor.name] = node.getAttributes();
					}
				}
			}
		}	catch(e) {
			console.log('error!:',e);
		}
    })

	// console.log('atributos!!',this.attributes);
    return this.attributes
  }

  /**
   *
   * @returns {CFDI}
   */
  getInstance () {
    return this
  }

  /**
   *
   * @returns {*}
   */
  getAttributes () {
    return Object.assign(this.attributes, this.getDefaultAttributes())
  }

  /**
   *
   * @returns {{}}
   */
  getParentAttributes () {
    return this.parentAttributes
  }

  /**
   *
   * @returns {*}
   */
  getWrapperAttributes () {
    return this.wrapperAttributes
  }

  /**
   *
   * @returns {{}}
   */
  getDefaultAttributes () {
    return {}
  }

  /**
   *
   * @returns {null}
   */
  get nodeName () {
    return null;
  }

  /**
   *
   * @returns {null}
   */
  get parentNodeName () {
    return null;
  }

  /**
   *
   * @returns {null}
   */
  get wrapperNodeName () {
    return null;
  }

  /**
   *
   * @returns {boolean}
   */
  get multiple () {
    return false;
  }

  /**
   *
   * @param node
   */
  add (node) {
    this.nodes.push(node)
  }

  /**
   *
   * @returns {*}
   */
  getNodes () {
    return this.nodes
  }

  /**
   *
   * @param data
   * @returns {{}}
   * @private
   */
  _parseAttributes (data) {
    let _data = {}
    Object.keys(data).forEach(key => {
      _data[`$${key}`] = data[key]
    })

    return _data
  }
}

module.exports = Node

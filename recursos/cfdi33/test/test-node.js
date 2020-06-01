'use strict'

const expect = require('chai').expect
const Node = require('../lib/Node/Node')

describe('Node', () => {
  it('getAttributes', () => {
    const MyNode = class extends Node{};
    const attributes = {'key': 'value'}
    const myNode = new MyNode(attributes)

    expect({'$key': 'value'}).to.deep.equal(myNode.getAttributes())
  })

  it('getInstance', () => {
    const MyNode = class extends Node{};
    const instance = new MyNode
    expect(instance.getInstance()).to.equal(instance)
  })

  it('getParentAttributes', () => {
    const MyNode = class extends Node{};
    const parentAttributes = {'key': 'value'}
    const myNode = new MyNode({}, parentAttributes)

    expect({'$key': 'value'}).to.deep.equal(myNode.getParentAttributes())
  })

  it('getWrapperAttributes', () => {
    const MyNode = class extends Node{};
    const wrapperAttributes = {'key': 'value'}
    const myNode = new MyNode({}, {}, wrapperAttributes)

    expect({'$key': 'value'}).to.deep.equal(myNode.getWrapperAttributes())
  })

  it('getDefaultAttributes', () => {
    const MyNode = class extends Node{
      getDefaultAttributes () {
        return {
          '$algo': 'algo'
        }
      }
    };

    expect({'$algo': 'algo'}).to.deep.equal((new MyNode).getDefaultAttributes())
  })

  it('nodeName', () => {
    const MyNode = class extends Node{
      get nodeName () {
        return 'algo:algo'
      }
    };

    expect('algo:algo').to.equal((new MyNode).nodeName)
  })

  it('parentNodeName', () => {
    const MyNode = class extends Node{
      get parentNodeName () {
        return 'algo:algo'
      }
    };

    expect('algo:algo').to.equal((new MyNode).parentNodeName)
  })

  it('wrapperNodeName', () => {
    const MyNode = class extends Node{
      get wrapperNodeName () {
        return 'algo:algo'
      }
    };

    expect('algo:algo').to.equal((new MyNode).wrapperNodeName)
  })

  it('multiple', () => {
    const MyNode = class extends Node{
      get multiple () {
        return false
      }
    };

    expect(false).to.equal((new MyNode).multiple)
  })

  it('add and getNodes', () => {
    const MyNode = class extends Node{};
    const MyOtherNode = class extends Node{};
    const myNode = new MyNode();
    const myOtherNode = new MyOtherNode();
    myNode.add(myOtherNode);

    expect(myOtherNode).to.equal(myNode.getNodes()[0])
  })
})
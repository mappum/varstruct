'use strict'
var tap = require('tap')
var varstruct = require('../')

function noop () {}
var length42 = {
  name: 'length42',
  type: { encode: noop, decode: noop, encodingLength: function () { return 42 } }
}

tap.test('encode', function (t) {
  t.end()
})

tap.test('decode', function (t) {
  t.end()
})

tap.test('length', function (t) {
  t.test('return valid number', function (t) {
    var struct = varstruct([length42, length42])
    t.same(typeof struct.encodingLength, 'function')
    t.same(struct.encodingLength({}), 84)
    t.end()
  })

  t.test('varstruct copy items', function (t) {
    var items = [length42, length42]
    var struct = varstruct(items)
    items.push(length42)
    t.same(struct.encodingLength({}), 84)
    t.end()
  })

  t.end()
})

tap.test('assert object properties', function (t) {
  try {
    varstruct([ { foo: 'bar' } ])
    t.fail('error not thrown')
  } catch (err) {
    t.ok(err, 'error thrown')
    t.equal(err.message, 'Item missing "name" property', 'correct error message')
  }

  try {
    varstruct([ { name: 'foo' } ])
    t.fail('error not thrown')
  } catch (err) {
    t.ok(err, 'error thrown')
    t.equal(err.message, 'Item "foo" has invalid codec', 'correct error message')
  }

  try {
    varstruct([ { name: 'foo', type: {} } ])
    t.fail('error not thrown')
  } catch (err) {
    t.ok(err, 'error thrown')
    t.equal(err.message, 'Item "foo" has invalid codec', 'correct error message')
  }

  try {
    varstruct([ { name: 'foo', type: {
      decode: function () {}
    } } ])
    t.fail('error not thrown')
  } catch (err) {
    t.ok(err, 'error thrown')
    t.equal(err.message, 'Item "foo" has invalid codec', 'correct error message')
  }

  try {
    varstruct([ { name: 'foo', type: {
      decode: function () {},
      encode: function () {}
    } } ])
    t.fail('error not thrown')
  } catch (err) {
    t.ok(err, 'error thrown')
    t.equal(err.message, 'Item "foo" has invalid codec', 'correct error message')
  }

  try {
    varstruct([ { name: 'foo', type: {
      decode: function () {},
      encode: function () {},
      encodingLength: function () {}
    } } ])
    t.pass('error not thrown')
  } catch (err) {
    t.fail('error thrown')
  }

  t.end()
})

tap.test('bitcoin transactions', function (t) {
  var VarUIntBitcoin = require('varuint-bitcoin')
  var TxInput = varstruct([
    { name: 'hash', type: varstruct.Buffer(32) },
    { name: 'index', type: varstruct.UInt32LE },
    { name: 'script', type: varstruct.VarBuffer(VarUIntBitcoin) },
    { name: 'sequence', type: varstruct.UInt32LE }
  ])
  var TxOutput = varstruct([
    { name: 'value', type: varstruct.UInt64LE },
    { name: 'script', type: varstruct.VarBuffer(VarUIntBitcoin) }
  ])
  var Tx = varstruct([
    { name: 'version', type: varstruct.UInt32LE },
    { name: 'ins', type: varstruct.VarArray(VarUIntBitcoin, TxInput) },
    { name: 'outs', type: varstruct.VarArray(VarUIntBitcoin, TxOutput) },
    { name: 'locktime', type: varstruct.UInt32LE }
  ])

  function buffer2hex (obj) {
    for (var k in obj) {
      if (Buffer.isBuffer(obj[k])) obj[k] = obj[k].toString('hex')
      else if (Array.isArray(obj[k])) obj[k] = obj[k].map(buffer2hex)
      else if (typeof obj[k] === 'object') obj[k] = buffer2hex(obj[k])
    }
    return obj
  }

  function isHex (s) {
    return s.length % 2 === 0 && /^[0-9a-f]*$/.test(s)
  }

  function hex2buffer (obj) {
    for (var k in obj) {
      if (Array.isArray(obj[k])) obj[k] = obj[k].map(hex2buffer)
      else if (typeof obj[k] === 'string' && isHex(obj[k])) obj[k] = new Buffer(obj[k], 'hex')
    }
    return obj
  }

  require('./fixtures/bitcoin-tx.json').forEach(function (fixture) {
    t.test('encode ' + fixture.description, function (t) {
      var result = Tx.encode(hex2buffer(fixture.raw))
      t.same(result.toString('hex'), fixture.hex)
      t.end()
    })

    t.test('decode ' + fixture.description, function (t) {
      var result = Tx.decode(new Buffer(fixture.hex, 'hex'))
      t.same(buffer2hex(result), buffer2hex(fixture.raw))
      t.end()
    })
  })

  t.end()
})

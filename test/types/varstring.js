'use strict'
var tap = require('tap')
var varstruct = require('../../lib')

tap.test('encode', function (t) {
  t.test('value must be a string', function (t) {
    t.throws(function () {
      varstruct.VarString(varstruct.UInt32BE).encode(null)
    }, new TypeError('value must be a string'))
    t.end()
  })

  t.end()
})

tap.test('encode/decode', function (t) {
  var buf = new Buffer(100)
  var encodings = [
    'ascii',
    'utf8',
    'utf16le',
    'base64',
    'binary',
    'hex'
  ]

  encodings.forEach(function (encoding) {
    t.test('encoding: ' + encoding, function (t) {
      var s = buf.toString(encoding)
      var varstring = varstruct.VarString(varstruct.UInt32BE, encoding)
      t.same(varstring.decode(varstring.encode(s)), s)
      t.end()
    })
  })

  t.end()
})

tap.test('length', function (t) {
  t.test('value must be a string', function (t) {
    t.throws(function () {
      varstruct.VarString(varstruct.UInt32BE).encodingLength(null)
    }, new TypeError('value must be a string'))
    t.end()
  })

  t.test('Unknown encoding', function (t) {
    t.throws(function () {
      varstruct.VarString(varstruct.UInt32BE, 'h1').encodingLength('')
    }, new TypeError('Unknown encoding: h1'))
    t.end()
  })

  t.end()
})

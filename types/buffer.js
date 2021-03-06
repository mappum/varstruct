'use strict'

module.exports = function (length) {
  function encode (value, buffer, offset) {
    if (!Buffer.isBuffer(value)) throw new TypeError('value must be a Buffer instance')
    if (value.length !== length) throw new RangeError('value.length is out of bounds')
    if (!buffer) return new Buffer(value)
    if (!offset) offset = 0
    if (offset + length > buffer.length) throw new RangeError('destination buffer is too small')
    value.copy(buffer, offset, 0, length)
    return buffer
  }

  function decode (buffer, offset) {
    if (!offset) offset = 0
    if (offset + length > buffer.length) throw new RangeError('not enough data for decode')
    return new Buffer(buffer.slice(offset, offset + length))
  }

  encode.bytes = decode.bytes = length
  return { encode: encode, decode: decode, encodingLength: function () { return length } }
}

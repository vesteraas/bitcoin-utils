var bitcoin = require('bitcoin')
var async = require('async')
var _ = require('underscore')
var validator = require('validator')

function Utils (options) {
  if (options === undefined) {
    throw new Error('options object is missing')
  }

  if (typeof options !== 'object') {
    throw new Error('options parameter should be an object')
  }

  if (options.host === undefined) {
    throw new Error('options.url parameter is missing')
  }

  if (!validator.isURL(options.host)) {
    throw new Error('options.host parameter is not a valid URL')
  }

  if (options.port === undefined) {
    throw new Error('options.port parameter is missing')
  }

  if (!validator.isInt(options.port)) {
    throw new Error('options.port parameter should be an integer')
  }

  if (options.user === undefined) {
    throw new Error('options.user parameter is missing')
  }

  if (!(typeof options.user === 'string' || options.user instanceof String)) {
    throw new Error('options.user parameter should be a string')
  }

  if (options.pass === undefined) {
    throw new Error('options.pass parameter is missing')
  }

  if (!(typeof options.pass === 'string' || options.pass instanceof String)) {
    throw new Error('options.pass parameter should be a string')
  }

  if (options.timeout === undefined) {
    throw new Error('options.timeout parameter is missing')
  }

  if (!validator.isInt(options.timeout)) {
    throw new Error('options.timeout parameter should be an integer')
  }

  this.client = new bitcoin.Client(options)
}

Utils.prototype.getUnspentOutputs = function (amount, callback) {
  if (amount === undefined) {
    throw new Error('amount parameter is missing')
  }

  if (!validator.isInt(amount)) {
    throw new Error('amount parameter should be an integer')
  }

  if (callback === undefined) {
    throw new Error('callback parameter is missing')
  }

  if (typeof callback !== 'function') {
    throw new Error('callback parameter should be a function')
  }

  var that = this
  async.waterfall([
    function (callback) {
      that.client.cmd('listunspent', function (err, unspents, resHeaders) {
        if (err) {
          return callback(err)
        }

        var total = 0

        var result = []
        _.each(unspents, function (unspent) {
          if (unspent.spendable && (total < amount)) {
            result.push({hash: unspent.txid, index: unspent.vout, amount: unspent.amount * 100000000, address: unspent.address})
            total += unspent.amount * 100000000
          }
        })
        if (result.length > 0) {
          callback(null, result)
        } else {
          callback(new Error('No spendable outputs'))
        }
      })
    }, function (unspents, callback) {
      async.each(unspents, function (unspent, callback) {
        that.client.cmd('dumpprivkey', unspent.address, function (err, key, resHeaders) {
          if (err) {
            return callback(err)
          }

          unspent.privateKey = key

          callback(null, unspent)
        })
      }, function (err) {
        if (err) {
          callback(err)
        } else {
          callback(null, unspents)
        }
      })
    }
  ],
  function (err, result) {
    callback(err, result)
  })
}

Utils.prototype.getNewAddress = function (callback) {
  if (callback === undefined) {
    throw new Error('callback parameter is missing')
  }

  if (typeof callback !== 'function') {
    throw new Error('callback parameter should be a function')
  }

  var that = this

  var result = {}

  async.waterfall([
    function (callback) {
      that.client.cmd('getnewaddress', function (err, address, resHeaders) {
        if (err) {
          return callback(err)
        }

        result.address = address

        callback(err, result)
      })
    },
    function (result, callback) {
      that.client.cmd('dumpprivkey', result.address, function (err, key, resHeaders) {
        if (err) {
          return callback(err)
        }

        result.key = key

        callback(null, result)
      })
    }
  ],
  function (err, result) {
    callback(err, result)
  })
}

Utils.prototype.sendRawTransaction = function (raw, callback) {
  if (raw === undefined) {
    throw new Error('raw parameter is missing')
  }

  if (!(typeof raw === 'string' || raw instanceof String)) {
    throw new Error('raw parameter should be a string')
  }

  if (callback === undefined) {
    throw new Error('callback parameter is missing')
  }

  if (typeof callback !== 'function') {
    throw new Error('callback parameter should be a function')
  }

  this.client.cmd('sendrawtransaction', raw, function (err, hash, resHeaders) {
    if (err) {
      return callback(err)
    }

    callback(null, hash)
  })
}

module.exports = Utils

var bitcoin = require('bitcoin')
var async = require('async')
var _ = require('underscore')
var validator = require('validator')

function Utils (options) {
  if (!options) {
    throw new Error('options object is missing')
  }

  if (typeof options !== 'object') {
    throw new Error('options parameter should be an object')
  }

  if (!options.host) {
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

  if (!(typeof options.user === 'string' || options.user instanceof String)) {
    throw new Error('options.user parameter should be a string')
  }

  if (!validator.isInt(options.port)) {
    throw new Error('options.port parameter should be an integer')
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
  var that = this
  async.waterfall([
    function (callback) {
      that.client.cmd('listunspent', function (err, unspents, resHeaders) {
        if (err) {
          return callback(err)
        }

        var toSpend = []
        var remaining = amount

        var filtered = unspents.filter(function (value) {
          var itemVal = (typeof value === 'object') ? value['amount'] : null
          if (!isNaN(itemVal) && itemVal > 0 && itemVal <= amount) {
            return true
          } else {
            return false
          }
        })

        filtered.sort(function (a, b) {
          return a['amount'] < b['amount']
        })

        for (var i = 0; i < filtered.length; i++) {
          var value = filtered[i]['amount']

          if ((remaining - value) >= 0) {
            remaining = remaining - value

            toSpend.push(filtered[i])
            delete filtered[i]

            if (remaining <= 0) {
              break
            }
          }
        }

        var result = []

        _.each(toSpend, function (unspent) {
          if (unspent.spendable) {
            result.push({hash: unspent.txid, index: unspent.vout, amount: unspent.amount, address: unspent.address})
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
  this.client.cmd('sendrawtransaction', raw, function (err, hash, resHeaders) {
    if (err) {
      return callback(err)
    }

    callback(null, hash)
  })
}

module.exports = Utils

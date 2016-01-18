var bitcoin = require('bitcoin')
var async = require('async')
var _ = require('underscore')

function Utils(host, port, user, password, timeout) {
  this.client = new bitcoin.Client({
    host: host,
    port: port,
    user: user,
    pass: password,
    timeout: timeout
  })
}

Utils.prototype.getUnspentOutputs = function (amount, callback) {
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
            if (unspent.spendable) {
              if (total < unspent.amount) {
                result.push({hash: unspent.txid, index: unspent.vout, amount: unspent.amount, address: unspent.address})
                total += unspent.amount
              }
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
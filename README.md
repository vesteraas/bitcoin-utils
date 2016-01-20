# bitcoin-utils

## Usage
The **```getNewAddress()```** function returns a new address with its corresponding private key.

The **```getUnspentOutputs()```** function returns an array containing unspents outputs where the total amount is less than or equal to the given amount.  If no input with a value less than or equal to the given amount is found, an empty array is returned.

All amounts are in satoshis.

```javascript
var Utils = require('../')

var utils = new Utils({
  host: '127.0.0.1',
  port: 8332,
  user: 'username',
  pass: 'password',
  timeout: 30000
})

utils.getNewAddress(function (err, address) {
  console.log(address)
})

/*
{
	address: 'mgK2stvZjCu95HYgAsuaWBTH7YRrJFwK4g',
	key: 'cSm5T5y5eQwghKZkqF6GkmrL5ce4cct8srT2VMUPFhspKUEnex4f'
}
*/

utils.getUnspentOutputs(110000, function (err, outputs) {
  console.log(outputs)
})

/*
[{
	hash: 'c3622663cc051651fc10329a31b52e9e408261d9d3474becd6c2d8aaa425c87d',
	index: 2948,
	amount: 50000,
	address: 'mzP1xGCAARsDXrAHiVxQFPBgRCze8YGmqy',
	privateKey: 'cSYn5RB729kfAftFdgypTNLeoi6okgYS9tiJwj31Cw9oXMr3NQyX'
}, {
	hash: '44d449913d9bc26302a820ec5531aaf4b1e12acc881f4281a4ff43a411738b9a',
	index: 351,
	amount: 60000,
	address: 'mvf3dGmFws1myDVxcEFkWtmyZpqUh1fobL',
	privateKey: 'cVqS9XAnLB4fDh6oYwfdPD6EjgSkExsT7WvdiR3QMgDMGBoKChMa'
}]
*/

```
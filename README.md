# bitcoin-utils

## Usage

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

utils.getUnspentOutputs(2, function (err, outputs) {
  console.log(outputs)
})
```
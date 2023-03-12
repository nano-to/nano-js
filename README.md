![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">Nano Developer Wallet</h1>

<h3 align="center">In Development. Not ready for use.</h3>

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

**Local:**
```html
<script src="/latest.js"></script>
```

**CDN:**
```html
<script src="https://offline.nano.to/latest.js"></script>
```

**NPM:**
```js
// npm install fwd/nano-offline
const wallet = require('@fwd/nano-offline')
```

**USAGE:**
```js
// console.log(window.nano)

// nano.endpoint = 'https://rpc.nano.to'

// Import existing Wallet
// await nano.import({ publicKey: env.publicKey, privateKey: env.privateKey })

// Or Generate new Wallet
var new_one = await nano.generate()

// Check balance.
console.log( await nano.balance(new_one) )

// Send Nano
await nano.send({
    to: 'nano_1sj3...',
    amount: '0.2',
    from: new_one.publicKey
}) 

// Wait for an incoming payment Nano
await nano.wait({ amount: '1.0293', account: new_one.publicKey })   

// Receive Pending Nano
await nano.receive(new_one.publicKey)   

// RPC to any Public Node
await nano.rpc({ action: 'block_count', account: new_one.publicKey }) 

// Open Up Nanolooker
await nano.nanolooker(new_one.publicKey) // https://nanolooker.com/account/nano_1address..
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### License

MIT (No Commercial Restrictions)

Contact [@nano2dev](mailto:support@nano.to) for licensing questions.

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Stargazers

[![Stargazers over time](https://starchart.cc/fwd/nano-js.svg)](https://github.com/fwd/nano-js)

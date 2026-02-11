![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

<h1 align="center">Enterprise Nano Wallet</h1>

<p align="center">Zero dependency Nano currency wallet for Browser, Node.js & CLI</p>

<p align="center">
  <a href="https://github.com/fwd/nano-js/actions/workflows/test.yml"><img src="https://github.com/fwd/nano-js/actions/workflows/test.yml/badge.svg" alt="Tests"></a>
  <a href="https://www.npmjs.com/package/@nano/wallet"><img src="https://img.shields.io/npm/v/@nano/wallet.svg?color=blue" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@nano/wallet"><img src="https://img.shields.io/npm/dm/@nano/wallet.svg?color=blue" alt="npm downloads"></a>
  <a href="https://github.com/fwd/nano-js"><img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="Zero Dependencies"></a>
  <a href="https://github.com/fwd/nano-js/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@nano/wallet.svg?color=blue" alt="License"></a>
  <a href="https://github.com/fwd/nano-js"><img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node.js"></a>
  <a href="https://github.com/fwd/nano-js"><img src="https://img.shields.io/badge/ESM%20%7C%20CJS%20%7C%20Browser-universal-blue" alt="Universal"></a>
</p>

![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

## Install

**NPM:**
```bash
npm install @nano/wallet
```

**Browser (CDN):**
```html
<script src="https://unpkg.com/@nano/wallet"></script>
```

**CLI (global):**
```bash
npm install -g @nano/wallet
```

## Import

```js
// CommonJS (require)
const nano = require('@nano/wallet')

// ESM (import)
import nano from '@nano/wallet'

// ESM named imports
import { generate, convert, send, receive } from '@nano/wallet'

// Browser (global)
// <script src="https://unpkg.com/@nano/wallet"></script>
// Available as window.nano
```

![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

## Quick Start

```js
const nano = require('@nano/wallet')

nano.app({
    node: 'https://rpc.nano.to',
    rpc_key: 'YOUR_API_KEY', // free key @ rpc.nano.to
    database: 'encrypted_wallet.txt',
    secret: 'SUPER_SECRET_PASSWORD'
})

;(async () => {

    // Create checkout
    var payment = await nano.checkout({ amount: '0.00133' })

    console.log(payment.browser)

    // Wait for payment
    var success = await nano.waitFor(payment)

    // Receive pending
    var receive = await nano.receive()

    // Send payment
    var send = await nano.send({
        to: 'YOUR_FRIENDS_ADDRESS',
        amount: '0.00133'
    })

    console.log(send)

})()
```

![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

## RPC (rpc.nano.to)

This wallet works seamlessly with [rpc.nano.to](https://rpc.nano.to), a free and paid RPC-as-a-Service for the Nano network.

```js
// Free RPC
nano.app({ node: 'https://rpc.nano.to' })

// With API key (higher limits)
nano.app({
    node: 'https://rpc.nano.to',
    rpc_key: 'YOUR_API_KEY'
})

// Raw RPC calls
await nano.rpc({ action: "block_count" })
// { "count": "215474654", "unchecked": "4", "cemented": "215474654" }

await nano.rpc({ action: "account_info", account: "nano_1abc..." })

await nano.rpc({ action: "process", json_block: "true", subtype: "send", block: signedBlock })
```

![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

## CLI

```bash
# Generate a new wallet
nano-wallet generate

# Check balance
nano-wallet balance nano_1abc...

# Get account info
nano-wallet account_info nano_1abc...

# Raw RPC call
nano-wallet rpc block_count
nano-wallet rpc account_info account=nano_1abc...

# Convert units
nano-wallet convert 1.5 NANO RAW

# With custom RPC endpoint or API key
nano-wallet rpc block_count --node https://rpc.nano.to --key YOUR_API_KEY

# Environment variables
export NANO_RPC=https://rpc.nano.to
export NANO_RPC_KEY=YOUR_API_KEY
nano-wallet rpc block_count
```

![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

## Offline API

```js
nano.generate()
```
```js
nano.import( nano.generate() )
```
```js
nano.accounts()
```
```js
nano.add_account()
```
```js
nano.sign(block)
```
```js
nano.convert('421.70', 'NANO', 'RAW') // 421700000000000000000000000000000
```
```js
nano.encrypt('any_string', process.env.PASSWORD) // AES-256
```
```js
nano.decrypt('any_string', process.env.PASSWORD) // UTF-8
```
```js
nano.export()
```

## Wallet Management

> Build non-custodial Nano applications with AES-256 encrypted wallet persistence.

```js
nano.app({ 
    node: 'https://rpc.nano.to',
    rpc_key: 'RPC_API_KEY', // get free key @ rpc.nano.to
    database: 'aes_string.txt', 
    secret: 'SUPER_SECRET_PASSWORD'
})

console.log( nano.accounts() )

await nano.receive()

await nano.send({ to: '@faucet', amount: 0.001 })
```

## Multi-Account (Metadata)

```js
nano.app({ 
    node: 'https://rpc.nano.to',
    rpc_key: 'RPC_API_KEY',
    database: 'aes_string.txt', 
    secret: 'SUPER_SECRET_PASSWORD'
})

const user = { userId: 'JoeDoe' }

console.log( nano.add_account(user) )

await nano.receive(user)

var balance = await nano.balance(user)

console.log( balance )

await nano.send({ 
    to: user, 
    from: 0,
    amount: '0.0000133'
})
```

## Balances

```js
// get all balances
await nano.balances()

// get balance of specific address
await nano.balance({ userId: 'johnDoe' })
// {
//     "balance": "325586539664609129644855132177",
//     "pending": "2309372510769300000000000000000000",
//     "receivable": "2309372510769300000000000000000000",
//     "balance_nano": "0.32558653966460912964",
//     "pending_nano": "2309.3725107693",
//     "receivable_nano": "2309.3725107693"
// }
```

## Send

```js
// send to globally known accounts
await nano.send({ to: '@fosse', amount: 0.1 })

// send to multiple accounts
await nano.send({ to: [ '@fosse', '@bank' ], amount: 0.1 })

// send all funds on address
await nano.send({ to: '@fosse', amount: 'all' })

// transfer between your own accounts
await nano.send({ to: 1, from: 0, amount: 0.1 })

// transfer between your own users
await nano.send({ to: { userId: 'johnDoe' }, from: { userId: 'janeDoe' }, amount: 0.1 })
```

## Receive

```js
// receive all
await nano.receive()

// receive all for specific address
await nano.receive({ userId: 'johnDoe' })
```

## Checkout

```js
var checkout = await nano.checkout({ address: 0, amount: '0.133' })
console.log( checkout )
// {
//     "id": "CHECKOUT_ID",
//     "browser": "https://nano.to/id_CHECKOUT_ID",
//     "json": "https://api.nano.to/checkout/CHECKOUT_ID",
//     "check": "https://api.nano.to/check/CHECKOUT_ID",
//     "address": "YOUR_ADDRESS",
//     "qrcode": "data:image/png;base64"
// }

var payment = await nano.waitFor(checkout)
console.log( payment )
// {
//     id: 'b06a8127',
//     success: true,
//     block: '3C0D9A50649C6BE...',
//     amount: '0.133',
//     amount_raw: '1330000000000000000000000'
// }
```

## Manual Signing

**SEND**

```js
var send = nano.sign({
    walletBalanceRaw: '18618869000000000000000000000000',
    toAddress: 'nano_3kyb49tqpt39ekc49kbej51ecsjqnimnzw1swxz4boix4ctm93w517umuiw8',
    representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',
    frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',
    transactionHash: 'CBC911F57B6827649423C92C88C0C56637A4274FF019E77E24D61D12B5338783',
    amountRaw: '7000000000000000000000000000000',
}, process.env.PRIVATE_KEY) 
```

**RECEIVE**

```js
var receive = nano.sign({
    walletBalanceRaw: '18618869000000000000000000000000',
    toAddress: 'nano_3kyb49tqpt39ekc49kbej51ecsjqnimnzw1swxz4boix4ctm93w517umuiw8',
    representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',
    frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',
    transactionHash: 'CBC911F57B6827649423C92C88C0C56637A4274FF019E77E24D61D12B5338783',
    amountRaw: '7000000000000000000000000000000',
    work: 'c5cf86de24b24419',
}, process.env.PRIVATE_KEY) 

var hash = await nano.process( receive )
```

**CHANGE_REP**

```js
var change_rep = nano.sign({
    walletBalanceRaw: '3000000000000000000000000000000',
    address: 'nano_3igf8hd4sjshoibbbkeitmgkp1o6ug4xads43j6e4gqkj5xk5o83j8ja9php',
    representativeAddress: 'nano_1anrzcuwe64rwxzcco8dkhpyxpi8kd7zsjc1oeimpc3ppca4mrjtwnqposrs',
    frontier: '128106287002E595F479ACD615C818117FCB3860EC112670557A2467386249D4',
    work: '0000000000000000',
}, process.env.PRIVATE_KEY) 

var hash = await nano.process( change_rep )
```

## Export Wallet

> JSON object, stringified and encrypted with AES-256

```js
nano.offline({ 
    filename: 'aes_string.txt', 
    password: process.env.PASSWORD
})

console.log( nano.export() )
```

![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

## Zero Dependencies

This package has **zero external npm dependencies**. All cryptographic libraries are vendored and sandboxed directly in the source:

- [nanocurrency-web-js](https://github.com/numsu/nanocurrency-web-js) — Wallet generation, block signing, Ed25519, Blake2b
- [crypto-js](https://github.com/brix/crypto-js) — AES-256 encryption (unified across Browser & Node.js)

This eliminates supply chain attack vectors while keeping the package fully self-contained.

![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

## GET FREE NANO

- https://nanodrop.io/
- https://freenanofaucet.com/
- https://getnano.ovh/faucet

## License

MIT

![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

## Sponsor (DigitalOcean)

<a align="center" target="_blank" href="https://m.do.co/c/f139acf4ddcb"><img style="object-fit: contain;
    max-width: 100%;" src="https://github.com/fwd/fwd/raw/master/ads/digitalocean_new.png" width="970" /></a>

![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

## Stargazers

[![Stargazers over time](https://starchart.cc/fwd/nano-js.svg)](https://github.com/fwd/nano-js)

![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

<h1 align="center">Nano JS Wallet</h1>

![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

**BROWSER:**
```html
<script src="https://unpkg.com/@nano/wallet"></script>
```

**NPM:**
```js
// npm install @nano/wallet
const nano = require('@nano/wallet')
```

![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

## Basic Usage

```js
// npm install @nano/wallet
const nano = require('@nano/wallet')

nano.app({
    node: 'https://rpc.nano.to',
    database: 'encrypted_wallet.txt',
    secret: 'SUPER_SECRET_PASSWORD'
})

;(async () => {

var payment = await nano.checkout({
    amount: '0.00133'
})

console.log( payment.browser )

var success = await nano.waitFor(payment)

var receive = await nano.receive()

var send = await nano.send({
    to: 'YOUR_FRIENDS_ADDRESS',
    amount: '0.00133'
})

console.log( send )

})()
```


![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

## OFFLINE API

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

## PUBLIC RPC

```js
var qrcode = await nano.qrcode()
console.log( qrcode ) // base64:png..
```

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
```

```js
var payment = await nano.waitFor(checkout)
console.log( payment )
// {
//     id: 'b06a8127',
//     success: true,
//     block: '3C0D9A50649C6BE04263...A773C321EDD2603EFEB',
//     json: 'https://api.nano.to/checkout/b06a8127',
//     address: 'nano_37y6iq8m...xpb9jrcwhkmoxpo61f4o',
//     browser: 'https://nanobrowse.com/block/3C0D9A50649C6BE04263...A773C321EDD2603EFEB',
//     amount: '0.133',
//     amount_raw: '1330000000000000000000000'
// }
```

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

```js
// receive all
await nano.receive()
// receive all for specific address
await nano.receive({ userId: 'johnDoe' })
// [
//   {
//     hash: '6147D4B0632E522E91D8DB48E0ACA0D96A19A7149E69EDEB24FE92C039EB5C8C',
//     amount: '1000000000000000000000000',
//     amount_nano: '0.000001000000000000000000000000',
//     source: 'nano_37y6iq8m1zx9inwkkcgqh34kqsihzpjfwgp9jir8xpb9jrcwhkmoxpo61f4o',
//     send_hash: 'A32EEDA7589290B49A2D724BB1F0ADB7A631C626447D8A29998858CA272714B4'
//   }
// ]
```

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

// [
//   {
//     to: 'nano_1bank1q3q7x8rimo3hf6qu6ezq3fmtximyt8kggtfaosg8kyr51qsdkm8g45',
//     from: 'nano_1komhob8amguaora5zkt4u3ybiz35he1g7puuxfqe5ywjc1tkf6pm1nqprp3',
//     hash: 'BCF9F79EEE7A26010465DB587206AB57735079DDE2242DFC6B9300EE0D27955C',
//     amount: '1000000000000000000000000',
//     browser: 'https://nanobrowse.com/block/BCF9F79EEE7A26010465DB587206AB57735079DDE2242DFC6B9300EE0D27955C'
//   }
// ]
```

```js
await nano.rpc({ action: "block_count" })

// {
//     "count": "199484966",
//     "unchecked": "8",
//     "cemented": "199484966",
//     "node": "@humblenano-1"
// }
```

## MANUAL SIGNING

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
    representativeAddress: 'nano_1anrzcuwe64rwxzcco8dkhpyxpi8kd7zsjc1oeimpc3ppca4mrjtwnqposrs', // new rep
    frontier: '128106287002E595F479ACD615C818117FCB3860EC112670557A2467386249D4',
    work: '0000000000000000',
}, process.env.PRIVATE_KEY) 

var hash = await nano.process( change_rep )
```

**SIGNED**

```
{
  type: 'state',
  account: 'nano_3kyb49tqpt39ekc49kbej51ecsjqnimnzw1swxz4boix4ctm93w517umuiw8',
  previous: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',
  representative: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',
  balance: '25618869000000000000000000000000',
  link: 'CBC911F57B6827649423C92C88C0C56637A4274FF019E77E24D61D12B5338783',
  signature: 'd5dd2a53becfc8c3fd17ddee2aba651ef6ac28571b66a4dfb2f4820c7d04d235d226d1fb176eb3958bbbfb9145663a0b4ffffd59cfc4b23af24a2af5f51e6a0e',
  work: ''
}
```

## LOCALSTORAGE

> Build non-custodial Nano applications by persisting Wallets client-side. Using AES-256 encryption. The longer ```SUPER_SECRET_PASSWORD```, the more secure. 

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

## METADATA

```js
nano.app({ 
    node: 'https://rpc.nano.to',
    rpc_key: 'RPC_API_KEY', // get free key @ rpc.nano.to
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
    from: 0, // wallet with index of 0
    amount: '0.0000133'
})
```

## EXPORT WALLET

> JSON object, stringified and encrypted with AES-256

```js

nano.offline({ 
    filename: 'aes_string.txt', 
    password: process.env.PASSWORD
})

console.log( nano.export() )

```

**Encrypted:**
```text
AES-256::U2FsdGVkX1+jBdpxz6hMNOqWmidZQPqHjOHq7sGi94U0dMuPZsDfPRGVVDVQH5ZfvXku6aqEfmoR9LwoBbKKxGxrAzOwf2SvNcmvwdAsgAkmieOwVOCDbob46yMN7TZUnRDIOSNq3tEozfaf9vbH3SdRZgkCukblN5m+lA0yxKSDaPiczANZMgP6NdtjMNo2SHVVmJhWgz4i8MDCfk6ZeZChxL6UyuqR0hKyY0wEtXHndTapQuVYQ/Oyvb9ccNfqvgxirmYERiXPEFi/vndPwmS2AEGih7fWndSARkXtLgG3xTI2tWYvoMIef4ZouiFtOhfOXuiab0OteoQmlmW6C03Nb4e2SZrFyyIF9wWkXDcpHSqPBUJJzOPF/p8c8fyEbhpe/iEs6pObrLOSoh8S+t016ZF3ARntCeBtMVZCiwVS94Ru+zGcDVxJiny/oBywznxPlkCAnf4m5Tn6E9LpeLdi14feuGTCerGYW3MYM3jJbqUGRuaGw6OB1hRcKtpe3QLR/lmnw1jRkpux6K+5P2p4GsacK/l0Ul5caGnCeQWeDll3q8DIFD4Qhvp1qnawhMvpYu/RCwVTGvLFlkhYS/DruJEQuVErHK8bhfAvPZaF3Eyw5qzCoUaukcl2S1i5HzPsMgcxSfRxCmCH37bKd8YfE3wiC+7AatsN1QOvzzY=
```

**Decrypted:**
```json
{
    "mnemonic": "body hire team image luxury banana panther tiny clog beauty only cover frost tourist process grit unlock rice",
    "seed": "7202a6eb69fa3a465539648c35e55ad7e295f25c9a7a340f82b3d3e338f....33a4ee0939cd44a7abb1afe83ff2170cae4",
    "accounts": [{
        "accountIndex": 0,
        "private": "d7cace49b3a20f83.....58cb61b8f2ef84f3",
        "address": "nano_1h4ymsbu....3wotjakm1copzy56bd8na"
    }]
}
```

![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

## GET FREE NANO

- https://nanodrop.io/
- https://freenanofaucet.com/
- https://faucet.prussia.dev/nano
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

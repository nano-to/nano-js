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
nano.app({ 
    node: 'https://us-1.nano.to',
    rpc_key: 'YOUR_RPC_KEY',
    database: 'localstorage.db',
    secret: 'SUPER_SECRET_PASSWORD'
})

nano.add_account({ userId: 'JoeMama' })

var payment = await nano.checkout({ 
    address: { userId: 'JoeMama' }, 
    amount: '0.133' 
})

var success = await nano.waitFor(payment)

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
await nano.qrcode()
```

```js
var checkout = await nano.checkout({ address: 0, amount: '0.133' })
```

```js
var payment = await nano.confirm(checkout)
```

```js
await nano.process(signedBlock)
```

```js
await nano.balances()
```

```js
await nano.receive()
```

```js
// send to globally known accounts
await nano.send({ to: '@fosse', amount: 0.1 })

// transfer between your own accounts
await nano.send({ to: 1, from: 0, amount: 0.1 })

// transfer between your own users
await nano.send({ to: { userId: 'johnDoe' }, from: { userId: 'janeDoe' }, amount: 0.1 })
```

```js
await nano.rpc({ action: "block_count" })
```

## LOCALSTORAGE

> Build non-custodial Nano applications by persisting Wallets client-side. Using AES-256 encryption. The longer ```process.env.PASSWORD```, the more secure. 

```js
nano.app({ 
    node: 'https://rpc.nano.to',
    rpc_key: 'RPC_API_KEY', // get free key @ rpc.nano.to
    database: 'aes_string.txt', 
    secret: 'SUPER_SECRET_PASSWORD'
})

console.log( nano.accounts() )

await nano.receive()

await nano.send({ 
    to: [ 'nano_1faucet7b6xjyha7m13objpn5ubkquzd6ska8kwopzf1ecbfmn35d1zey3ys' ], 
    amount: nano.convert(0.001, 'NANO', 'RAW') // 'all'
})
```

## METADATA

```js
nano.app({ 
    node: 'https://rpc.nano.to',
    rpc_key: 'RPC_API_KEY', // get free key @ rpc.nano.to
    database: 'aes_string.txt', 
    secret: 'SUPER_SECRET_PASSWORD'
})

const userId = johnDoe

console.log( nano.add_account({ userId }) )

await nano.receive()

await nano.send({ 
    to: { userId }, 
    from: 0, // your first account
    amount: '0.133'
})
```

## IMPORT/EXPORT

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

## License

MIT

![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

## Sponsor (DigitalOcean)

<a align="center" target="_blank" href="https://m.do.co/c/f139acf4ddcb"><img style="object-fit: contain;
    max-width: 100%;" src="https://github.com/fwd/fwd/raw/master/ads/digitalocean_new.png" width="970" /></a>

![line](https://github.com/nano-currency/node-cli/raw/main/.github/line.png)

## Stargazers

[![Stargazers over time](https://starchart.cc/fwd/nano-js.svg)](https://github.com/fwd/nano-js)

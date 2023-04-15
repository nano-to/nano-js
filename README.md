![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">Offline Nano Wallet</h1>

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

**LOCAL:**
```html
<script src="/nano.js"></script>
```

**CDN:**
```html
<script src="https://unpkg.com/@nano/wallet"></script>
```

**NPM:**
```js
// npm install @nano/wallet
const nano = require('@nano/wallet')
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

**SELF-SIGNING:**
```js
var send = nano.sign({
    walletBalanceRaw: '18618869000000000000000000000000',
    toAddress: 'nano_3kyb49tqpt39ekc49kbej51ecsjqnimnzw1swxz4boix4ctm93w517umuiw8',
    representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',
    frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',
    transactionHash: 'CBC911F57B6827649423C92C88C0C56637A4274FF019E77E24D61D12B5338783',
    amountRaw: '7000000000000000000000000000000',
}, process.env.PRIVATE_KEY) 

console.log( send )

// {
//   type: 'state',
//   account: 'nano_3kyb49tqpt39ekc49kbej51ecsjqnimnzw1swxz4boix4ctm93w517umuiw8',
//   previous: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',
//   representative: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',
//   balance: '25618869000000000000000000000000',
//   link: 'CBC911F57B6827649423C92C88C0C56637A4274FF019E77E24D61D12B5338783',
//   signature: 'd5dd2a53becfc8c3fd17ddee2aba651ef6ac28571b66a4dfb2f4820c7d04d235d226d1fb176eb3958bbbfb9145663a0b4ffffd59cfc4b23af24a2af5f51e6a0e',
//   work: ''
// }
```

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
nano.sign(block, process.env.privateKey)
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
nano.export(process.env.PASSWORD)
```

## REQUIRES INTERNET

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
await nano.send({ to: '@fosse', amount: 0.1 })
```

```js
await nano.rpc({ action: "block_count" })
```

## LOCALSTORAGE

> Build non-custodial Nano applications by persisting Wallets client-side. Using AES-256 encryption. The longer ```process.env.PASSWORD```, the more secure. 

```js
nano.offline({ 
    filename: 'aes_encrypted_string.txt', 
    password: process.env.PASSWORD 
})

console.log( nano.accounts() )

await nano.receive()

await nano.send({ 
    to: [ 'nano_1faucet7b6xjyha7m13objpn5ubkquzd6ska8kwopzf1ecbfmn35d1zey3ys' ], 
    amount: nano.convert(0.001, 'NANO', 'RAW') // 'all'
})
```

## IMPORT/EXPORT

> A JSON string encrypted with AES-256 with and user defined secret. Looking for a UI, try importing wallet into (Nault)[https://nault.cc]

```js

nano.offline({ 
    filename: 'aes_encrypted_string.txt', 
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
    "mnemonic": "body hire team image luxury banana panther tiny clog beauty only cover frost tea pioneer between salt magnet ugly tourist process grit unlock rice",
    "seed": "7202a6eb69fa3a465539648c35e55ad7e295f25c9a7a340f82b3d3e338f....33a4ee0939cd44a7abb1afe83ff2170cae4",
    "accounts": [{
        "accountIndex": 0,
        "private": "d7cace49b3a20f83.....58cb61b8f2ef84f3",
        "address": "nano_1h4ymsbu....3wotjakm1copzy56bd8na"
    }]
}
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### License

MIT

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Stargazers

[![Stargazers over time](https://starchart.cc/fwd/nano-offline.svg)](https://github.com/fwd/nano-offline)

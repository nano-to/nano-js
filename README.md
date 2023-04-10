![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">JavaScript Nano Wallet</h1>

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

**USAGE:**
```js
nano.app({ 
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
![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## Offline Signing

**SEND:**

```js
const privateKey = 'PRIVATE_KEY'

const send_block = {
    // Your current balance in RAW from account info
    walletBalanceRaw: '18618869000000000000000000000000',
    // Your address
    toAddress: 'nano_3kyb49tqpt39ekc49kbej51ecsjqnimnzw1swxz4boix4ctm93w517umuiw8',
    // From account info
    representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',
    // From account info
    frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',
    // From the pending transaction
    transactionHash: 'CBC911F57B6827649423C92C88C0C56637A4274FF019E77E24D61D12B5338783',
    // From the pending transaction in RAW
    amountRaw: '7000000000000000000000000000000',
    // Generate the work server-side or with a DPOW service
    // This is optional, you don't have to generate work before signing the transaction
    work: 'c5cf86de24b24419',
}

const signed_send_block = nano.sign(send_block, privateKey)
// nano.process(signed_send_block)
```

**RECEIVE:**
```js
const receive_block = {
    // Your current balance in RAW from account info
    walletBalanceRaw: '18618869000000000000000000000000',

    // Your address
    toAddress: 'nano_3kyb49tqpt39ekc49kbej51ecsjqnimnzw1swxz4boix4ctm93w517umuiw8',

    // From account info
    representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',

    // From account info
    frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',

    // From the pending transaction
    transactionHash: 'CBC911F57B6827649423C92C88C0C56637A4274FF019E77E24D61D12B5338783',

    // From the pending transaction in RAW
    amountRaw: '7000000000000000000000000000000',

    // Generate the work server-side or with a DPOW service
    // This is optional, you don't have to generate work before signing the transaction
    work: 'c5cf86de24b24419',
}

const signed_receive_block = nano.sign(receive_block, privateKey)
// nano.process(signed_receive_block)
```

**CHANGE REP:**
```js
const rep_change = {
    // Your current balance, from account info
    walletBalanceRaw: '3000000000000000000000000000000',

    // Your wallet address
    address: 'nano_3igf8hd4sjshoibbbkeitmgkp1o6ug4xads43j6e4gqkj5xk5o83j8ja9php',

    // The new representative
    representativeAddress: 'nano_1anrzcuwe64rwxzcco8dkhpyxpi8kd7zsjc1oeimpc3ppca4mrjtwnqposrs',

    // Previous block, from account info
    frontier: '128106287002E595F479ACD615C818117FCB3860EC112670557A2467386249D4',

    // Generate work on the server side or with a DPOW service
    // This is optional, you don't have to generate work before signing the transaction
    work: '0000000000000000',
}

// Returns a correctly formatted and signed block ready to be sent to the blockchain
const signed_change_block = nano.sign(rep_change, privateKey)
// nano.process(signed_change_block)
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## Utilities

**CONVERT:**
```js

nano.convert('421.70', 'NANO', 'RAW') // 421700000000000000000000000000000

nano.convert('421700000000000000000000000000000', 'RAW', 'NANO') // 421.70

```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### License

MIT

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Stargazers

[![Stargazers over time](https://starchart.cc/fwd/nano-offline.svg)](https://github.com/fwd/nano-offline)

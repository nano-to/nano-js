![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">Localhost Wallet</h1>

> In Development. Use with care.

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

> DOCS IN PROGRESS

**BASIC:**
```js
nano.import( nano.generate() )

console.log( await nano.accounts() ) 

await nano.wait({ 
    amount: '0.001',
    receive: true, // oh yeah.
    // webhook: 'https://secret.stuff/post' // nice, huh
})

await nano.send({ 
    to: [ 
        '@fosse',
        'nano_1faucet7b6xjyha7m13objpn5ubkquzd6ska8kwopzf1ecbfmn35d1zey3ys', 
        // ... 500 more
    ], 
    amount: nano.convert(0.0001, 'NANO', 'RAW'),
    // key: 'POW_KEY' 
})

await nano.send({ 
    to: 'nano_1faucet7b6xjyha7m13objpn5ubkquzd6ska8kwopzf1ecbfmn35d1zey3ys', 
    amount: (await wallet.balance()).balance // or 'all'
})

// from RAM not Blockchain
nano.destroy()
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### License

MIT

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Stargazers

[![Stargazers over time](https://starchart.cc/fwd/nano-offline.svg)](https://github.com/fwd/nano-offline)

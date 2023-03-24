![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">Offline.js</h1>

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

**LOCAL:**
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
const nano = require('@fwd/nano-offline')
```

**USAGE:**
```js
nano.import( nano.generate() )

console.log( await nano.accounts() ) 
// console.log( nano.accounts({ export: true }) ) 

// console.log( "QR Code:", await nano.qrcode() )
// console.log( "Open Link:", nano.nanolooker() )

await nano.wait({ 
    amount: '0.001',
    receive: true, // oh yeah.
    // webhook: 'https://your.secret.stuff/post' // nice, huh
})

await nano.send({ 
    to: [ 
        '@bot',
        '@fosse',
        'nano_1faucet7b6xjyha7m13objpn5ubkquzd6ska8kwopzf1ecbfmn35d1zey3ys', 
        '@keeri',
        // ... 500 more
    ], 
    amount: nano.convert(0.0001, 'NANO', 'RAW'),
    // key: 'POW_KEY' 
    // node: 'https://nanolooker.com'
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

MIT (No Commercial Restrictions)

Contact [@nano2dev](mailto:support@nano.to) for licensing questions.

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Stargazers

[![Stargazers over time](https://starchart.cc/fwd/nano-js.svg)](https://github.com/fwd/nano-js)

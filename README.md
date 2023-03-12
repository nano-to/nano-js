![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">Nano Offline Wallet</h1>

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
;(async () => {
    
    await wallet.generate()

    console.log( await wallet.accounts() )

    // console.log( "QR Code:", await wallet.qrcode() )

    await wallet.wait({ amount: '0.01' })

    await wallet.receive()

    await wallet.send({ 
        to: 'nano_1faucet7b6xjyha7m13objpn5ubkquzd6ska8kwopzf1ecbfmn35d1zey3ys', 
        amount: (await wallet.balance()).balance
    })

    await wallet.destroy()

})()
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### License

MIT (No Commercial Restrictions)

Contact [@nano2dev](mailto:support@nano.to) for licensing questions.

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Stargazers

[![Stargazers over time](https://starchart.cc/fwd/nano-js.svg)](https://github.com/fwd/nano-js)

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

```html
<!-- Usage -->
<script>

    // console.log(window.nano)

    // nano.endpoint = 'https://rpc.nano.to'

    // Import existing Wallet
    // await nano.import({ publicKey: env.publicKey, privateKey: env.privateKey })

    // Or Generate new Wallet
    await nano.generate()
    
    // Check balance.
    await nano.balance()

    // Send Nano
    await nano.send({
        to: 'nano_1sj3...',
        amount: '0.2'
    }) 

    // Receive pending Nano
    await nano.receive()  

    // Lease a Username
    await nano.lease('Username')  

    // RPC to Public Nodes
    await nano.rpc({ action: 'block_count' }) 
    
</script>
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### License

MIT (No Commercial Restrictions)

Contact [@nano2dev](mailto:support@nano.to) for licensing questions.

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Stargazers

[![Stargazers over time](https://starchart.cc/fwd/nano-js.svg)](https://github.com/fwd/nano-js)

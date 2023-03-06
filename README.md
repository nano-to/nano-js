![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">Nano Currency Javascript Wallet</h1>

<h3 align="center">In Development. Not ready for use.</h3>

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

```html
<!-- Local -->
<script src="/nano.js"></script>

<!-- Usage -->
<script>

    console.log(window.nano)

    nano.endpoint = 'https://rpc.nano.to'

    // Import existing Wallet
    await nano.import({ publicKey: env.publicKey, privateKey: env.privateKey })

    // Or Generate new Wallet
    await nano.generate()
    
    // Check balance.
    await nano.balance()

    // Send Nano
    await nano.send({
        to: '@fosse',
        amount: '0.2'
    }) 

    // Receive pending Nano
    await nano.receive()  

    // Lease a Username
    await nano.lease('Username')  

    // RPC to Public Nodes
    await nano.rpc({ action: 'block_count' }) 

    // Simple HTML Paywall
    nano.paywall({ 
        element: '.premium', // required, all with class .premium
        address: 'YOUR_ADDRESS', // required
        amount: 0.001, // required
        debug: false, // optional
        free: false, // // optional, allow free access
        background: '#000000de', // optional css hex
        text: 'Read Lorem for', // optional
        title: '', // optional
        color: '', // optional
        endpoint: 'https://nanolooker.com/api/rpc', // optional
        success: (block) => {
            // Element(s) are automatically shown.
            console.log(block)
        }
    })

    // One-time Payment
    nano.charge({ 
        address: 'YOUR_ADDRESS', // required
        amount: 0.001, // required
        random: true, // recommended
        success: (block) => {
            console.log(block)
        }
    })
    
</script>
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### License

MIT (No Commercial Restrictions)

Contact [@nano2dev](mailto:support@nano.to) for licensing questions.

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Stargazers

[![Stargazers over time](https://starchart.cc/fwd/nano-js.svg)](https://github.com/fwd/nano-js)

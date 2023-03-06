![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">Non-Custodial Browser Libraries</h1>

<h3 align="center">Hosted on Github</h3>

### Offline Nano Wallet

**Wallet.js:**
```html
<!-- Local -->
<script src="/wallet.js"></script>
<!-- CDN -->
<script src="https://js.nano.to/wallet.js"></script>
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Non-Custodial Nano Paywall

Monetize any DOM element on your website.

> **This library is not for keeping secrets. It is to make it easier for users to support you. Anyone can bypass this kind of  paywall with some tinkering.**


**Paywall.js:**

```html
<!-- Local -->
<script src="/paywall.js"></script>
<!-- CDN -->
<script src="https://js.nano.to/paywall.js"></script>
```

```html
<script>
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
</script>
```

**Single Charge**

Accept one-time Nano payments.

```html
<script>
    // open up popup
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

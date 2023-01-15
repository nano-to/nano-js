![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">NanoPay.js</h1>

<h3 align="center">Non-custodial, back-end agnostic crypto monetization browser library.</h3>

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

![line](https://github.com/fwd/nano-pay/raw/master/img/splash.png)
![line](https://github.com/fwd/nano-pay/raw/master/img/splash2.png)
![line](https://github.com/fwd/nano-pay/raw/master/img/splash3.png)

### Demo

<a target="_blank" href="https://dev.nano.to">https://dev.nano.to</a>

### Nano Paywall

Monetize any DOM element on your website.

> **This library is not for keeping secrets from the public. It was created to make it easier for users to support you. Anyone can bypass paywalls with some tinkering.**

```html
<script src="https://nano.to/pay.js"></script>
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

### Single Charge

Accept one-time Nano payments.

```html
<script src="https://nano.to/pay.js"></script>
<script>
    // open up popup
    nano.charge({ 
        address: 'YOUR_ADDRESS', // required
        amount: 0.001, // required
        success: (block) => {
            console.log(block)
        }
    })
</script>
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### License

**Limited Commercial:**

- ✅ Personal & Open Source
- ✅ Commercial use where NanoPay.js is **NOT** the end-product.
- ❌ Commercial use where NanoPay.js **IS** the end-product.

Contact [@nano2dev](mailto:support@nano.to) for licensing questions.

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Stargazers

[![Stargazers over time](https://starchart.cc/fwd/nano-pay.svg)](https://github.com/fwd/nano-pay)

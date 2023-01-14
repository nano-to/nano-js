![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">NanoPay.js</h1>

<h3 align="center">Monetize any website element.</h3>

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

![line](https://github.com/fwd/nano-pay/raw/master/img/splash.png)
![line](https://github.com/fwd/nano-pay/raw/master/img/splash2.png)
![line](https://github.com/fwd/nano-pay/raw/master/img/splash3.png)

### Demo

<a target="_blank" href="https://dev.nano.to">https://dev.nano.to</a>

### Usage

```html
<script src="https://dev.nano.to/pay.js"></script>
```

Non-custodial, back-end agnostic monetization library for Nano.

> This tools is not for keeping secrets from the public. It was created to make it easier for users to support you. Anyone can bypass paywalls with some tinkering.


### Usage

```html
<script>
nano.paywall({ 
    element: '.premium', // required, all with class .premium
    address: 'nano_1faucet7b6xjyha7m13objpn5ubkquzd6ska8kwopzf1ecbfmn35d1zey3ys', // required
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

### License

**Limited Commercial:**

- ✅ Personal & Open Source
- ✅ Commercial use where NanoPay.js is **NOT** the end-product.
- ❌ Commercial use where NanoPay.js **IS** the end-product.

Contact [@nano2dev](mailto:support@nano.to) for licensing questions.

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Stargazers

[![Stargazers over time](https://starchart.cc/fwd/nano-pay.svg)](https://github.com/fwd/nano-pay)

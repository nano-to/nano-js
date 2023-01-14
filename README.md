![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">Nano.to Developer (Beta)</h1>

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## NanoPay.js

Monetize any website element.

> This tools is not for keeping secrets from the public. It was created to make it easier for users to support you. Anyone can bypass paywalls with some tinkering.

#### Install

```html
<script src="https://dev.nano.to/pay.js"></script>
```

#### Initialize

```html
<script>
    nano.paywall({ 
        element: '.premium', // required, all with class .premium
        address: 'YOUR_ADDRESS', // required
        amount: 0.1, // required
        debug: false, // optional
        free: false, // // optional, allow free access
        background: '#000', // optional
        text: 'Read', // optional
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
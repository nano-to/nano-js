![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">NanoPay.js (Beta)</h1>
<h3 align="center">Non-Custodial, Backend Agnostic, Nano Payment Checking JS Library</h3>

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

> ## This tools is not for keeping secrets from the public. It was created to make it easier for users to support you.

## Install

```html
<script src="https://nano.to/pay.js"></script>
```

## Initialize

```html
<script>
    nano.paywall({ 
        debug: false,
        element: '.premium', // all with class .premium
        amount: 0.1,
        text: 'Read',
        address: 'YOUR_ADDRESS', 
        endpoint: 'https://nanolooker.com/api/rpc', // optional
        success: (block) => {
        	// Element(s) are automatically shown.
        	console.log(block)
        }
    })
</script>
```
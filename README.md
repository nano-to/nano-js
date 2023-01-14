![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">NanoPay.js (Beta)</h1>

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

Monetize any website element. 

## Install

```html
<script src="https://dev.nano.to/pay.js"></script>
```

## Initialize

```html
<script>
    nano.lock({ 
        amount: 0.1,
        element: '.premium', // all with class .premium
        text: 'Read',
        address: 'YOUR_ADDRESS', 
        success: (block) => {
        	// Element(s) are automatically shown.
        	console.log(block)
        }
    })
</script>
```
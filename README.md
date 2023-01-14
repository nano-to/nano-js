![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">Nano.to Developer Tools (Beta)</h1>

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Pay Per View

Monetize any website element. 

```html
<script src="https://dev.nano.to/pay.js"></script>
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
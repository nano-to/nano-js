const wallet = require('./latest')

;(async () => {
	
	await wallet.generate()

	console.log( await wallet.accounts() )

	// console.log( "QR Code:", await wallet.qrcode() )

	await wallet.wait({ amount: '0.23' })

	await wallet.receive()

	await wallet.send({ 
		to: 'nano_1faucet7b6xjyha7m13objpn5ubkquzd6ska8kwopzf1ecbfmn35d1zey3ys', 
		amount: await wallet.balance() 
	})

	await wallet.destroy()

})()
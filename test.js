const nano = require('./latest')

;(async () => {

	await nano.import( await nano.generate() )

	// console.log( await nano.accounts() )

	console.log( await nano.send({ to: '@faucet', amount: '0.0001' }) )

})()
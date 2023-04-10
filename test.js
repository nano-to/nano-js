;(async () => {

const nano = require('./latest')

nano.offline({ 
	filename: 'nano.wallet', 
	password: 'password' 
})

console.log( nano.accounts() )

})()
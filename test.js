const nano = require('./nano')

nano.offline({ 
    filename: 'aes_encrypted_string.txt', 
    password: process.env.PASSWORD
})

console.log( nano.accounts() )

// ;(async () => {
// 	console.log( await nano.balance() )
// })()
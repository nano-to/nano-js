#!/usr/bin/env node

// @nano/wallet CLI
// Usage: nano-wallet <command> [options]

const nano = require('../nano.js');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

const DEFAULT_WALLET = path.join(process.cwd(), 'nano-wallet.dat');

// ── Helpers ──────────────────────────────────────────────

function usage() {
	console.log(`
  @nano/wallet CLI — Enterprise Nano Wallet

  Usage: nano-wallet <command> [options]

  Commands:
    generate                        Generate new wallet and save locally
    receive                         Receive all pending blocks (pockets funds)
    send <to> <amount>              Send Nano (signs, publishes, confirms <1s)
    balance                         Get balance for wallet address
    account_info                    Get account info from RPC
    rpc <action> [key=value ...]    Raw RPC call to rpc.nano.to
    convert <amount> <from> <to>    Convert units (NANO/RAW)
    encrypt <file> <password>       Encrypt a file with AES-256
    decrypt <file> <password>       Decrypt an AES-256 encrypted file
    sign <block_json> <private_key> Sign a block
    pow <hash>                      Generate Proof of Work

  Options:
    --secret <password>             Wallet password (encrypts/decrypts wallet file)
    --wallet <file>                 Wallet file path (default: ./nano-wallet.dat)
    --node <url>                    RPC endpoint (default: https://rpc.nano.to)
    --key <api_key>                 RPC API key for rpc.nano.to
    --json                          Output raw JSON
    --help                          Show this help message

  Environment Variables:
    NANO_SECRET                     Wallet password (alternative to --secret)
    NANO_WALLET                     Wallet file path (alternative to --wallet)
    NANO_RPC                        RPC endpoint (default: https://rpc.nano.to)
    NANO_RPC_KEY                    API key for rpc.nano.to

  Quick Start:
    nano-wallet generate --secret mypassword
    nano-wallet receive --secret mypassword
    nano-wallet send nano_1to... 0.001 --secret mypassword

  With Environment Variables:
    export NANO_SECRET=mypassword
    nano-wallet generate
    nano-wallet receive
    nano-wallet send nano_1to... 0.001
    nano-wallet balance
`);
}

function getFlag(name) {
	const idx = args.indexOf('--' + name);
	if (idx === -1) return null;
	return args[idx + 1] || true;
}

function hasFlag(name) {
	return args.includes('--' + name);
}

// Get positional args (skipping flags and their values)
function getPositional() {
	const positional = [];
	for (let i = 1; i < args.length; i++) {
		if (args[i].startsWith('--')) { i++; continue; }
		positional.push(args[i]);
	}
	return positional;
}

function jsonOut(data) {
	console.log(JSON.stringify(data, null, 2));
}

function setupRpc() {
	const node = getFlag('node') || process.env.NANO_RPC || 'https://rpc.nano.to';
	const key = getFlag('key') || process.env.NANO_RPC_KEY || '';
	nano.endpoint = node;
	nano.rpc_key = key;
}

function getSecret() {
	return getFlag('secret') || process.env.NANO_SECRET || null;
}

function getWalletPath() {
	return getFlag('wallet') || process.env.NANO_WALLET || DEFAULT_WALLET;
}

function loadWallet() {
	const secret = getSecret();
	const walletPath = getWalletPath();
	if (!secret) {
		console.error('Error: wallet password required. Use --secret <password> or set NANO_SECRET');
		process.exit(1);
	}
	if (!fs.existsSync(walletPath)) {
		console.error(`Error: wallet file not found at ${walletPath}`);
		console.error('Run "nano-wallet generate --secret <password>" first.');
		process.exit(1);
	}
	nano.offline({ database: walletPath, secret, node: nano.endpoint });
	return nano.wallets;
}

// ── Commands ─────────────────────────────────────────────

async function main() {
	if (!command || command === '--help' || command === '-h' || command === 'help') {
		return usage();
	}

	setupRpc();

	switch (command) {

		case 'generate': {
			const secret = getSecret();
			const walletPath = getWalletPath();
			if (!secret) {
				console.error('Error: password required to encrypt wallet. Use --secret <password> or set NANO_SECRET');
				process.exit(1);
			}
			if (fs.existsSync(walletPath)) {
				console.error(`Error: wallet already exists at ${walletPath}`);
				console.error('Delete it first or use --wallet <path> to save elsewhere.');
				process.exit(1);
			}
			// Generate, encrypt, and save in one step
			nano.offline({ database: walletPath, secret, node: nano.endpoint });
			// Retrieve the full wallet data (including mnemonic) for display
			const walletData = nano.wallet();
			console.log(`Wallet saved to ${walletPath}`);
			console.log(`Address: ${walletData.accounts[0].address}`);
			console.log(`Mnemonic: ${walletData.mnemonic}`);
			console.log('');
			console.log('IMPORTANT: Save your mnemonic phrase. It is the only way to recover your wallet.');
			if (hasFlag('json')) {
				jsonOut({
					mnemonic: walletData.mnemonic,
					seed: walletData.seed,
					accounts: walletData.accounts.map(a => ({
						index: a.accountIndex,
						address: a.address,
						private: a.private,
						public: a.public
					}))
				});
			}
			break;
		}

		case 'balance': {
			const pos = getPositional();
			let address = pos[0];
			if (!address) {
				const wallets = loadWallet();
				address = wallets[0].address;
			}
			const res = await nano.rpc({ action: 'account_balance', account: address });
			if (res.error) return console.error('Error:', res.error);
			res.balance_nano = nano.convert(res.balance, 'RAW', 'NANO');
			res.receivable_nano = nano.convert(res.receivable || res.pending || '0', 'RAW', 'NANO');
			jsonOut(res);
			break;
		}

		case 'account_info': {
			const pos = getPositional();
			let address = pos[0];
			if (!address) {
				const wallets = loadWallet();
				address = wallets[0].address;
			}
			const res = await nano.rpc({ action: 'account_info', account: address, representative: 'true' });
			jsonOut(res);
			break;
		}

		case 'rpc': {
			const pos = getPositional();
			const action = pos[0];
			if (!action) return console.error('Error: action required. Usage: nano-wallet rpc <action> [key=value ...]');
			const body = { action };
			for (let i = 1; i < pos.length; i++) {
				const [key, ...rest] = pos[i].split('=');
				if (rest.length) body[key] = rest.join('=');
			}
			const res = await nano.rpc(body);
			jsonOut(res);
			break;
		}

		case 'convert': {
			const pos = getPositional();
			const amount = pos[0];
			const from = pos[1];
			const to = pos[2];
			if (!amount || !from || !to) return console.error('Usage: nano-wallet convert <amount> <from> <to>\nExample: nano-wallet convert 1.5 NANO RAW');
			try {
				const result = nano.convert(amount, from, to);
				console.log(result);
			} catch (e) {
				console.error('Error:', e.message);
			}
			break;
		}

		case 'send': {
			const pos = getPositional();
			const to = pos[0];
			const amount = pos[1];
			if (!to || !amount) return console.error('Usage: nano-wallet send <to> <amount>');
			const wallets = loadWallet();
			const from = wallets[0].address;
			try {
				const res = await nano.send({ from, to, amount });
				if (!res || !res.length) return console.error('Error: send returned no results');
				for (const block of res) {
					console.log(`Sent ${block.amount} NANO`);
					console.log(`  to:   ${block.to}`);
					console.log(`  from: ${block.from}`);
					console.log(`  hash: ${block.hash}`);
					console.log(`  view: ${block.browser}`);
				}
				if (hasFlag('json')) jsonOut(res);
			} catch (e) {
				console.error('Error:', e.message);
				process.exit(1);
			}
			break;
		}

		case 'receive': {
			const wallets = loadWallet();
			try {
				const blocks = await nano.receive();
				if (!blocks || !blocks.length) {
					console.log('No pending blocks to receive.');
					break;
				}
				console.log(`Received ${blocks.length} block(s):`);
				for (const block of blocks) {
					console.log(`  ${block.amount_nano} NANO — hash: ${block.hash}`);
				}
				if (hasFlag('json')) jsonOut(blocks);
			} catch (e) {
				console.error('Error:', e.message);
				process.exit(1);
			}
			break;
		}

		case 'encrypt': {
			const pos = getPositional();
			const file = pos[0];
			const password = pos[1];
			if (!file || !password) return console.error('Usage: nano-wallet encrypt <file> <password>');
			try {
				const content = fs.readFileSync(file, 'utf8');
				console.log(nano.encrypt(content, password));
			} catch (e) {
				console.error('Error:', e.message);
			}
			break;
		}

		case 'decrypt': {
			const pos = getPositional();
			const file = pos[0];
			const password = pos[1];
			if (!file || !password) return console.error('Usage: nano-wallet decrypt <file> <password>');
			try {
				const content = fs.readFileSync(file, 'utf8');
				const decrypted = nano.decrypt(content, password);
				console.log(typeof decrypted === 'string' ? decrypted : JSON.stringify(decrypted, null, 2));
			} catch (e) {
				console.error('Error:', e.message);
			}
			break;
		}

		case 'sign': {
			const pos = getPositional();
			const blockJson = pos[0];
			const privateKey = pos[1];
			if (!blockJson || !privateKey) return console.error('Usage: nano-wallet sign <block_json> <private_key>');
			try {
				const block = JSON.parse(blockJson);
				const signed = nano.sign(block, privateKey);
				jsonOut(signed);
			} catch (e) {
				console.error('Error:', e.message);
			}
			break;
		}

		case 'pow': {
			const pos = getPositional();
			const hash = pos[0];
			if (!hash) return console.error('Usage: nano-wallet pow <hash>');
			try {
				const work = await nano.pow({ frontier: hash });
				console.log(work);
			} catch (e) {
				console.error('Error:', e.message);
			}
			break;
		}

		default:
			console.error(`Unknown command: ${command}`);
			usage();
			process.exit(1);
	}
}

main().catch(err => {
	console.error('Error:', err.message);
	process.exit(1);
});

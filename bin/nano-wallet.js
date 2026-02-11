#!/usr/bin/env node

// @nano/wallet CLI
// Usage: nano-wallet <command> [options]

const nano = require('../nano.js');

const args = process.argv.slice(2);
const command = args[0];

// ── Helpers ──────────────────────────────────────────────

function usage() {
	console.log(`
  @nano/wallet CLI — Enterprise Nano Wallet

  Usage: nano-wallet <command> [options]

  Commands:
    generate                        Generate a new wallet (mnemonic + seed + address)
    balance <address>               Get balance for a Nano address
    account_info <address>          Get account info from RPC
    send <from> <to> <amount>       Send Nano (raw addresses)
    receive <address>               Receive all pending for address
    rpc <action> [key=value ...]    Raw RPC call to rpc.nano.to
    convert <amount> <from> <to>    Convert units (NANO/RAW)
    encrypt <file> <password>       Encrypt a file with AES-256
    decrypt <file> <password>       Decrypt an AES-256 encrypted file
    sign <block_json> <private_key> Sign a block
    pow <hash>                      Generate Proof of Work

  Options:
    --node <url>                    RPC endpoint (default: https://rpc.nano.to)
    --key <api_key>                 RPC API key for rpc.nano.to
    --json                          Output raw JSON
    --help                          Show this help message

  Environment Variables:
    NANO_RPC                        RPC endpoint (default: https://rpc.nano.to)
    NANO_RPC_KEY                    API key for rpc.nano.to
    NANO_WALLET                     Wallet file path
    NANO_SECRET                     Wallet password

  Examples:
    nano-wallet generate
    nano-wallet balance nano_1abc...
    nano-wallet rpc block_count
    nano-wallet rpc account_info account=nano_1abc...
    nano-wallet convert 1.5 NANO RAW
    nano-wallet send nano_1from... nano_1to... 0.001
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

function jsonOut(data) {
	if (hasFlag('json')) {
		console.log(JSON.stringify(data, null, 2));
	} else {
		console.log(JSON.stringify(data, null, 2));
	}
}

function setupRpc() {
	const node = getFlag('node') || process.env.NANO_RPC || 'https://rpc.nano.to';
	const key = getFlag('key') || process.env.NANO_RPC_KEY || '';
	nano.endpoint = node;
	nano.rpc_key = key;
}

// ── Commands ─────────────────────────────────────────────

async function main() {
	if (!command || command === '--help' || command === '-h' || command === 'help') {
		return usage();
	}

	setupRpc();

	switch (command) {

		case 'generate': {
			const wallet = nano.generate();
			console.log(JSON.stringify({
				mnemonic: wallet.mnemonic,
				seed: wallet.seed,
				accounts: wallet.accounts.map(a => ({
					index: a.accountIndex,
					address: a.address,
					private: a.private,
					public: a.public
				}))
			}, null, 2));
			break;
		}

		case 'balance': {
			const address = args[1];
			if (!address) return console.error('Error: address required. Usage: nano-wallet balance <address>');
			const res = await nano.rpc({ action: 'account_balance', account: address });
			if (res.error) return console.error('Error:', res.error);
			res.balance_nano = nano.convert(res.balance, 'RAW', 'NANO');
			res.receivable_nano = nano.convert(res.receivable || res.pending || '0', 'RAW', 'NANO');
			jsonOut(res);
			break;
		}

		case 'account_info': {
			const address = args[1];
			if (!address) return console.error('Error: address required. Usage: nano-wallet account_info <address>');
			const res = await nano.rpc({ action: 'account_info', account: address, representative: 'true' });
			jsonOut(res);
			break;
		}

		case 'rpc': {
			const action = args[1];
			if (!action) return console.error('Error: action required. Usage: nano-wallet rpc <action> [key=value ...]');
			const body = { action };
			for (let i = 2; i < args.length; i++) {
				if (args[i].startsWith('--')) { i++; continue; }
				const [key, ...rest] = args[i].split('=');
				if (rest.length) body[key] = rest.join('=');
			}
			const res = await nano.rpc(body);
			jsonOut(res);
			break;
		}

		case 'convert': {
			const amount = args[1];
			const from = args[2];
			const to = args[3];
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
			const walletFile = getFlag('wallet') || process.env.NANO_WALLET;
			const secret = getFlag('secret') || process.env.NANO_SECRET;
			const from = args[1];
			const to = args[2];
			const amount = args[3];
			if (!from || !to || !amount) return console.error('Usage: nano-wallet send <from> <to> <amount>');
			if (walletFile && secret) {
				nano.offline({ database: walletFile, secret, node: nano.endpoint });
			}
			const res = await nano.rpc({
				action: 'account_info',
				account: from,
				representative: 'true'
			});
			if (res.error) return console.error('Error getting account info:', res.error);
			console.log('Account info retrieved. Use the library API for full send flow.');
			jsonOut(res);
			break;
		}

		case 'receive': {
			const address = args[1];
			if (!address) return console.error('Error: address required');
			const res = await nano.rpc({ action: 'receivable', account: address, source: 'true' });
			jsonOut(res);
			break;
		}

		case 'encrypt': {
			const file = args[1];
			const password = args[2];
			if (!file || !password) return console.error('Usage: nano-wallet encrypt <file> <password>');
			const fs = require('fs');
			try {
				const content = fs.readFileSync(file, 'utf8');
				console.log(nano.encrypt(content, password));
			} catch (e) {
				console.error('Error:', e.message);
			}
			break;
		}

		case 'decrypt': {
			const file = args[1];
			const password = args[2];
			if (!file || !password) return console.error('Usage: nano-wallet decrypt <file> <password>');
			const fs = require('fs');
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
			const blockJson = args[1];
			const privateKey = args[2];
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
			const hash = args[1];
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

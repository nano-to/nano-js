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
    send <to> <amount> --pk <key>   Send Nano (signs, publishes, confirms <1s)
    receive <address> --pk <key>    Receive all pending blocks (pockets funds)
    rpc <action> [key=value ...]    Raw RPC call to rpc.nano.to
    convert <amount> <from> <to>    Convert units (NANO/RAW)
    encrypt <file> <password>       Encrypt a file with AES-256
    decrypt <file> <password>       Decrypt an AES-256 encrypted file
    sign <block_json> <private_key> Sign a block
    pow <hash>                      Generate Proof of Work

  Options:
    --pk <private_key>              Private key for signing send/receive blocks
    --from <address>                Source address (auto-detected from --pk if omitted)
    --node <url>                    RPC endpoint (default: https://rpc.nano.to)
    --key <api_key>                 RPC API key for rpc.nano.to
    --json                          Output raw JSON
    --help                          Show this help message

  Environment Variables:
    NANO_RPC                        RPC endpoint (default: https://rpc.nano.to)
    NANO_RPC_KEY                    API key for rpc.nano.to
    NANO_PRIVATE_KEY                Private key for signing (alternative to --pk)
    NANO_WALLET                     Wallet file path
    NANO_SECRET                     Wallet password

  Examples:
    nano-wallet generate
    nano-wallet balance nano_1abc...
    nano-wallet receive nano_1abc... --pk 69e0a0a...
    nano-wallet send nano_1to... 0.001 --pk 69e0a0a...
    nano-wallet rpc block_count
    nano-wallet convert 1.5 NANO RAW
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

function loadWalletFromKey(address, privateKey) {
	const password = '__cli_session__';
	nano.import({
		accounts: [{
			accountIndex: 0,
			address: address,
			private: privateKey,
		}]
	}, password);
}

function getPrivateKey() {
	return getFlag('pk') || process.env.NANO_PRIVATE_KEY || null;
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
			const to = args[1];
			const amount = args[2];
			const pk = getPrivateKey();
			const from = getFlag('from');
			if (!to || !amount) return console.error('Usage: nano-wallet send <to> <amount> --pk <private_key>\n       nano-wallet send <to> <amount> (with NANO_PRIVATE_KEY env var)');
			if (!pk) return console.error('Error: private key required. Use --pk <key> or set NANO_PRIVATE_KEY');
			if (!from) return console.error('Error: source address required. Use --from <nano_address>');
			loadWalletFromKey(from, pk);
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
			const address = args[1];
			const pk = getPrivateKey();
			if (!address) return console.error('Usage: nano-wallet receive <address> --pk <private_key>\n       nano-wallet receive <address> (with NANO_PRIVATE_KEY env var)');
			if (!pk) {
				// Fallback: just list receivable blocks (no signing)
				const res = await nano.rpc({ action: 'receivable', account: address, source: 'true' });
				if (res.blocks && typeof res.blocks === 'object' && Object.keys(res.blocks).length > 0) {
					console.log(`Found ${Object.keys(res.blocks).length} pending block(s). Provide --pk to pocket them.`);
				}
				jsonOut(res);
				break;
			}
			loadWalletFromKey(address, pk);
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

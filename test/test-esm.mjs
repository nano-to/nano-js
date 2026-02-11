import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import nano from '../nano.mjs';
import {
	generate, convert, encrypt, decrypt, sign, tools,
	accounts, offline, app, rpc, get, send, receive,
	balances, balance, pending, checkout, confirm, waitFor,
	qrcode, pow, block, findAccount, save, wallet, add_account
} from '../nano.mjs';

describe('ESM Import - default', () => {

	it('should import nano as default export', () => {
		assert.ok(nano, 'default export should exist');
		assert.equal(typeof nano, 'object', 'should be an object');
	});

	it('should have all core methods on default export', () => {
		const methods = [
			'generate', 'convert', 'encrypt', 'decrypt', 'sign',
			'accounts', 'offline', 'app', 'rpc', 'get', 'send',
			'receive', 'balances', 'balance', 'pending', 'checkout',
			'confirm', 'waitFor', 'qrcode', 'pow', 'block',
			'findAccount', 'save', 'wallet', 'add_account', 'export',
			'import', 'process', 'tools'
		];
		for (const method of methods) {
			assert.ok(nano[method] !== undefined, `should have ${method}`);
		}
	});
});

describe('ESM Import - named exports', () => {

	it('should export generate as named', () => {
		assert.equal(typeof generate, 'function');
		const w = generate();
		assert.ok(w.seed, 'generate should work');
		assert.ok(w.accounts[0].address.startsWith('nano_'));
	});

	it('should export convert as named', () => {
		assert.equal(typeof convert, 'function');
		assert.equal(convert('1', 'NANO', 'RAW'), '1000000000000000000000000000000');
	});

	it('should export encrypt/decrypt as named', () => {
		assert.equal(typeof encrypt, 'function');
		assert.equal(typeof decrypt, 'function');
		const enc = encrypt({ test: true }, 'pw');
		const dec = decrypt(enc, 'pw');
		assert.deepEqual(dec, { test: true });
	});

	it('should export sign as named', () => {
		assert.equal(typeof sign, 'function');
	});

	it('should export tools as named', () => {
		assert.ok(tools, 'tools should exist');
	});

	it('should export all wallet methods as named', () => {
		assert.equal(typeof accounts, 'function');
		assert.equal(typeof offline, 'function');
		assert.equal(typeof app, 'function');
		assert.equal(typeof save, 'function');
		assert.equal(typeof wallet, 'function');
		assert.equal(typeof add_account, 'function');
	});

	it('should export all network methods as named', () => {
		assert.equal(typeof rpc, 'function');
		assert.equal(typeof get, 'function');
		assert.equal(typeof send, 'function');
		assert.equal(typeof receive, 'function');
		assert.equal(typeof balances, 'function');
		assert.equal(typeof balance, 'function');
		assert.equal(typeof pending, 'function');
	});

	it('should export checkout methods as named', () => {
		assert.equal(typeof checkout, 'function');
		assert.equal(typeof confirm, 'function');
		assert.equal(typeof waitFor, 'function');
		assert.equal(typeof qrcode, 'function');
	});

	it('should export utility methods as named', () => {
		assert.equal(typeof pow, 'function');
		assert.equal(typeof findAccount, 'function');
	});
});

describe('ESM - functional tests', () => {

	it('should generate and encrypt wallet via named imports', () => {
		const w = generate();
		const enc = encrypt(w, 'esm_test');
		assert.ok(enc.startsWith('AES-256::'));
		const dec = decrypt(enc, 'esm_test');
		assert.equal(dec.seed, w.seed);
	});

	it('should convert units via named imports', () => {
		const raw = convert('2.5', 'NANO', 'RAW');
		const back = convert(raw, 'RAW', 'NANO');
		assert.equal(parseFloat(back), 2.5);
	});

	it('should sign blocks via named imports', () => {
		const w = generate();
		const signed = sign({
			walletBalanceRaw: '1000000000000000000000000000000',
			toAddress: w.accounts[0].address,
			representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',
			frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',
			transactionHash: 'CBC911F57B6827649423C92C88C0C56637A4274FF019E77E24D61D12B5338783',
			amountRaw: '500000000000000000000000000000',
			work: 'c5cf86de24b24419',
		}, w.accounts[0].private);
		assert.ok(signed.signature);
	});

	it('should findAccount via named imports', () => {
		const w = generate();
		const found = findAccount(w, 0);
		assert.ok(found);
		assert.equal(found.accountIndex, 0);
	});
});

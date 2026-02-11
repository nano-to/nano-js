const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const nano = require('../nano.js');

describe('nano.generate()', () => {

	it('should generate a wallet with mnemonic, seed, and accounts', () => {
		const wallet = nano.generate();
		assert.ok(wallet, 'wallet should exist');
		assert.ok(wallet.mnemonic, 'should have mnemonic');
		assert.ok(wallet.seed, 'should have seed');
		assert.ok(Array.isArray(wallet.accounts), 'should have accounts array');
		assert.ok(wallet.accounts.length >= 1, 'should have at least 1 account');
	});

	it('should generate valid nano_ addresses', () => {
		const wallet = nano.generate();
		const account = wallet.accounts[0];
		assert.ok(account.address.startsWith('nano_'), 'address should start with nano_');
		assert.equal(account.address.length, 65, 'address should be 65 chars');
	});

	it('should generate unique wallets each time', () => {
		const w1 = nano.generate();
		const w2 = nano.generate();
		assert.notEqual(w1.seed, w2.seed, 'seeds should be different');
		assert.notEqual(w1.mnemonic, w2.mnemonic, 'mnemonics should be different');
		assert.notEqual(w1.accounts[0].address, w2.accounts[0].address, 'addresses should be different');
	});

	it('should include private key in account', () => {
		const wallet = nano.generate();
		const account = wallet.accounts[0];
		assert.ok(account.private, 'should have private key');
		assert.equal(typeof account.private, 'string', 'private key should be string');
		assert.ok(account.private.length > 0, 'private key should not be empty');
	});

	it('should include accountIndex in account', () => {
		const wallet = nano.generate();
		assert.equal(wallet.accounts[0].accountIndex, 0, 'first account should have index 0');
	});

	it('should generate 24-word mnemonic', () => {
		const wallet = nano.generate();
		const words = wallet.mnemonic.split(' ');
		assert.equal(words.length, 24, 'mnemonic should be 24 words');
	});

	it('should generate 128-char hex seed', () => {
		const wallet = nano.generate();
		assert.ok(/^[0-9a-f]{128}$/i.test(wallet.seed), 'seed should be 128 hex chars');
	});
});

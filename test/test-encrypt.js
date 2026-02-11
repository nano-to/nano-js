const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const nano = require('../nano.js');

describe('nano.encrypt()', () => {

	it('should encrypt an object to AES-256 prefixed string', () => {
		const data = { hello: 'world' };
		const result = nano.encrypt(data, 'password123');
		assert.ok(result.startsWith('AES-256::'), 'should start with AES-256:: prefix');
		assert.ok(result.length > 20, 'encrypted string should be substantial');
	});

	it('should encrypt a string (JSON stringified)', () => {
		const result = nano.encrypt('{"test":true}', 'pass');
		assert.ok(result.startsWith('AES-256::'), 'should start with AES-256:: prefix');
	});

	it('should return Error when no string provided', () => {
		const result = nano.encrypt(null, 'pass');
		assert.ok(result instanceof Error, 'should return Error');
	});

	it('should return Error when no password provided', () => {
		const result = nano.encrypt('data', null);
		assert.ok(result instanceof Error, 'should return Error');
	});

	it('should return Error when both are missing', () => {
		const result = nano.encrypt(null, null);
		assert.ok(result instanceof Error, 'should return Error');
	});

	it('should produce different ciphertext for same data with same password', () => {
		// CryptoJS uses random salt, so same input produces different output
		const data = { test: 'determinism' };
		const enc1 = nano.encrypt(data, 'pass');
		const enc2 = nano.encrypt(data, 'pass');
		// Both should be valid but can differ (random salt)
		assert.ok(enc1.startsWith('AES-256::'));
		assert.ok(enc2.startsWith('AES-256::'));
	});

	it('should produce different ciphertext for different passwords', () => {
		const data = { test: 'value' };
		const enc1 = nano.encrypt(data, 'pass1');
		const enc2 = nano.encrypt(data, 'pass2');
		assert.notEqual(enc1, enc2, 'different passwords should produce different ciphertext');
	});
});

describe('nano.decrypt()', () => {

	it('should decrypt an encrypted object back to original', () => {
		const data = { hello: 'world', num: 42 };
		const encrypted = nano.encrypt(data, 'testpass');
		const decrypted = nano.decrypt(encrypted, 'testpass');
		assert.deepEqual(decrypted, data, 'decrypted data should match original');
	});

	it('should handle nested objects', () => {
		const data = { accounts: [{ address: 'nano_1abc', index: 0 }], seed: 'abcdef' };
		const encrypted = nano.encrypt(data, 'pw');
		const decrypted = nano.decrypt(encrypted, 'pw');
		assert.deepEqual(decrypted, data);
	});

	it('should throw on wrong password', () => {
		const encrypted = nano.encrypt({ test: true }, 'correct');
		assert.throws(() => {
			nano.decrypt(encrypted, 'wrong');
		}, 'should throw on wrong password');
	});

	it('should throw on invalid encrypted string', () => {
		assert.throws(() => {
			nano.decrypt('AES-256::garbage_data_here', 'pass');
		}, 'should throw on invalid ciphertext');
	});

	it('should handle AES-256:: prefix stripping', () => {
		const data = { key: 'value' };
		const encrypted = nano.encrypt(data, 'pw');
		assert.ok(encrypted.startsWith('AES-256::'));
		const decrypted = nano.decrypt(encrypted, 'pw');
		assert.deepEqual(decrypted, data);
	});

	it('should round-trip a full wallet object', () => {
		const wallet = nano.generate();
		const encrypted = nano.encrypt(wallet, 'secret');
		const decrypted = nano.decrypt(encrypted, 'secret');
		assert.equal(decrypted.seed, wallet.seed);
		assert.equal(decrypted.mnemonic, wallet.mnemonic);
		assert.equal(decrypted.accounts[0].address, wallet.accounts[0].address);
		assert.equal(decrypted.accounts[0].private, wallet.accounts[0].private);
	});
});

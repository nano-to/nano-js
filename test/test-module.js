const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('Module Loading', () => {

	describe('CJS require', () => {

		it('should load via require', () => {
			const nano = require('../nano.js');
			assert.ok(nano, 'module should load');
			assert.equal(typeof nano, 'object');
		});

		it('should export all expected properties', () => {
			const nano = require('../nano.js');
			const expected = [
				'aes256', 'wallets', 'rpc_key', 'endpoint', 'tools',
				'convert', 'block', 'default_rep', 'known', 'encrypt',
				'decrypt', 'accounts', 'save', 'offline', 'add_account',
				'import', 'migrate', 'balances', 'pending', 'generate', 'findAccount',
				'get', 'rpc', 'checkout', 'confirm', 'qrcode', 'pow',
				'wallet', 'receive', 'send', 'sign', 'process', 'export',
				'balance', 'app', 'waitFor'
			];
			for (const prop of expected) {
				assert.ok(prop in nano, `should have property: ${prop}`);
			}
		});

		it('should have correct default values', () => {
			const nano = require('../nano.js');
			assert.equal(nano.endpoint, 'https://rpc.nano.to');
			assert.equal(nano.rpc_key, '');
			assert.equal(nano.aes256, '');
			assert.deepEqual(nano.wallets, []);
			assert.equal(nano.known, 'https://nano.to/known.json');
			assert.equal(nano.default_rep, 'nano_1kd4h9nqaxengni43xy9775gcag8ptw8ddjifnm77qes1efuoqikoqy5sjq3');
		});

		it('nano.balance should be alias for nano.balances', () => {
			const nano = require('../nano.js');
			assert.equal(nano.balance, nano.balances);
		});

		it('nano.app should be alias for nano.offline', () => {
			const nano = require('../nano.js');
			assert.equal(nano.app, nano.offline);
		});

		it('nano.waitFor should be alias for nano.confirm', () => {
			const nano = require('../nano.js');
			assert.equal(nano.waitFor, nano.confirm);
		});
	});

	describe('CryptoJS Sandbox', () => {

		it('should not clobber module.exports with CryptoJS', () => {
			const nano = require('../nano.js');
			// If CryptoJS wasn't sandboxed, module.exports would be CryptoJS
			assert.ok(nano.generate, 'should have generate (not CryptoJS)');
			assert.ok(!nano.AES, 'should not have CryptoJS.AES on exports');
		});

		it('CryptoJS should be available internally (encrypt/decrypt work)', () => {
			const nano = require('../nano.js');
			const enc = nano.encrypt({ x: 1 }, 'pw');
			assert.ok(enc.startsWith('AES-256::'));
		});
	});

	describe('NanocurrencyWeb vendor', () => {

		it('should have tools with convert function', () => {
			const nano = require('../nano.js');
			assert.ok(nano.tools, 'should have tools');
			assert.ok(nano.tools.tools, 'should have tools.tools');
			assert.equal(typeof nano.tools.tools.convert, 'function', 'should have tools.tools.convert');
		});

		it('should have wallet generation', () => {
			const nano = require('../nano.js');
			assert.equal(typeof nano.generate, 'function');
		});
	});

	describe('package.json', () => {

		it('should have correct version', () => {
			const pkg = require('../package.json');
			assert.equal(pkg.version, '3.0.0');
		});

		it('should have zero dependencies', () => {
			const pkg = require('../package.json');
			assert.equal(Object.keys(pkg.dependencies || {}).length, 0);
		});

		it('should have exports field', () => {
			const pkg = require('../package.json');
			assert.ok(pkg.exports);
			assert.ok(pkg.exports['.'].import);
			assert.ok(pkg.exports['.'].require);
		});

		it('should have bin field', () => {
			const pkg = require('../package.json');
			assert.ok(pkg.bin);
			assert.ok(pkg.bin['nano-wallet']);
		});

		it('should have module field', () => {
			const pkg = require('../package.json');
			assert.equal(pkg.module, 'nano.mjs');
		});

		it('should have files field', () => {
			const pkg = require('../package.json');
			assert.ok(pkg.files.includes('nano.js'));
			assert.ok(pkg.files.includes('nano.mjs'));
			assert.ok(pkg.files.includes('bin/'));
		});
	});
});

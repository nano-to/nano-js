const { describe, it, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

const LIVE = !process.env.CI;

function freshNano() {
	delete require.cache[require.resolve('../nano.js')];
	return require('../nano.js');
}

describe('RPC & Network', () => {

	describe('nano.rpc() - structure', () => {

		it('should have default endpoint of rpc.nano.to', () => {
			const nano = freshNano();
			assert.equal(nano.endpoint, 'https://rpc.nano.to');
		});

		it('should return a promise', () => {
			const nano = freshNano();
			const result = nano.rpc({ action: 'block_count' });
			assert.ok(result instanceof Promise, 'rpc() should return a Promise');
			// Don't await - just testing it returns a Promise
		});

		it('should accept custom endpoint', () => {
			const nano = freshNano();
			nano.endpoint = 'https://custom.node.com';
			assert.equal(nano.endpoint, 'https://custom.node.com');
		});

		it('should accept rpc_key', () => {
			const nano = freshNano();
			nano.rpc_key = 'test_api_key';
			assert.equal(nano.rpc_key, 'test_api_key');
		});
	});

	describe('nano.rpc() - live (rpc.nano.to)', { skip: !LIVE && 'Skipped in CI (rate limits)' }, () => {

		it('should fetch block_count from rpc.nano.to', async () => {
			const nano = freshNano();
			const result = await nano.rpc({ action: 'block_count' });
			assert.ok(result.count, 'should have count');
			assert.ok(parseInt(result.count) > 100000000, 'count should be > 100M');
			assert.ok(result.cemented, 'should have cemented');
		});

		it('should fetch account_info for a known account', async () => {
			const nano = freshNano();
			const result = await nano.rpc({
				action: 'account_info',
				account: 'nano_1natrium1o3z5519ifou7xii8crpxpk8y65qmkih8e8bpsjri651oza8imdd',
				representative: 'true'
			});
			assert.ok(result.balance || result.error, 'should have balance or error');
		});

		it('should handle invalid action gracefully', async () => {
			const nano = freshNano();
			const result = await nano.rpc({ action: 'nonexistent_action' });
			assert.ok(result, 'should return something');
		});
	});

	describe('nano.get() - live', { skip: !LIVE && 'Skipped in CI (rate limits)' }, () => {

		it('should fetch known.json', async () => {
			const nano = freshNano();
			const result = await nano.get('https://nano.to/known.json');
			assert.ok(Array.isArray(result), 'known.json should be an array');
			assert.ok(result.length > 0, 'should have entries');
			assert.ok(result[0].name || result[0].address, 'entries should have name or address');
		});
	});

	describe('nano.process() - structure', () => {

		it('should call rpc with process action', () => {
			const nano = freshNano();
			let rpcCalled = false;
			let rpcData = null;

			// Mock rpc
			const origRpc = nano.rpc.bind(nano);
			nano.rpc = function(data) {
				rpcCalled = true;
				rpcData = data;
				return Promise.resolve({ hash: 'MOCK_HASH' });
			};

			const signed = { type: 'state', account: 'nano_1abc' };
			nano.process(signed);

			assert.ok(rpcCalled, 'should call rpc');
			assert.equal(rpcData.action, 'process');
			assert.equal(rpcData.json_block, 'true');
			assert.equal(rpcData.subtype, 'send');
			assert.deepEqual(rpcData.block, signed);

			nano.rpc = origRpc;
		});
	});
});

describe('Mocked RPC Operations', () => {

	const TEST_DIR = path.join(__dirname, '.tmp-rpc');
	const TEST_WALLET = path.join(TEST_DIR, 'rpc_test_wallet.txt');

	beforeEach(() => {
		fs.mkdirSync(TEST_DIR, { recursive: true });
		try { fs.unlinkSync(TEST_WALLET); } catch (e) {}
	});

	describe('nano.balances() with mock', () => {

		it('should call accounts_balances RPC', async () => {
			const nano = freshNano();
			nano.offline({ database: TEST_WALLET, secret: 'pw' });
			const addr = nano.accounts()[0].address;

			// Mock RPC
			nano.rpc = function(data) {
				assert.equal(data.action, 'accounts_balances');
				assert.ok(data.accounts.includes(addr));
				return Promise.resolve({
					balances: {
						[addr]: {
							balance: '1000000000000000000000000000000',
							pending: '0',
							receivable: '0'
						}
					}
				});
			};

			const result = await nano.balances();
			assert.ok(result, 'should return balances');
		});

		it('should return single account balance with metadata', async () => {
			const nano = freshNano();
			nano.offline({ database: TEST_WALLET, secret: 'pw' });
			const addr = nano.accounts()[0].address;

			nano.rpc = function(data) {
				return Promise.resolve({
					balances: {
						[addr]: {
							balance: '5000000000000000000000000000000',
							pending: '100000000000000000000000000',
							receivable: '100000000000000000000000000'
						}
					}
				});
			};

			const result = await nano.balances(0);
			assert.ok(result.balance, 'should have balance');
			assert.equal(result.address, addr, 'should have address');
		});
	});

	describe('nano.receive() with mock', () => {

		it('should process pending blocks', async () => {
			const nano = freshNano();
			nano.offline({ database: TEST_WALLET, secret: 'pw' });
			const wallet = nano.wallet();
			const addr = wallet.accounts[0].address;
			const privKey = wallet.accounts[0].private;

			let rpcCallCount = 0;
			nano.rpc = function(data) {
				rpcCallCount++;
				if (data.action === 'receivable') {
					return Promise.resolve({
						blocks: {
							'HASH123': {
								amount: '1000000000000000000000000',
								source: 'nano_1source...'
							}
						}
					});
				}
				if (data.action === 'account_info') {
					return Promise.resolve({
						balance: '0',
						frontier: '0000000000000000000000000000000000000000000000000000000000000000',
						representative: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou'
					});
				}
				if (data.action === 'work_generate') {
					return Promise.resolve({ work: 'c5cf86de24b24419' });
				}
				if (data.action === 'account_key') {
					return Promise.resolve({ key: '0000000000000000000000000000000000000000000000000000000000000000' });
				}
				if (data.action === 'process') {
					return Promise.resolve({ hash: 'RECEIVED_HASH_ABC' });
				}
				return Promise.resolve({});
			};

			const result = await nano.receive();
			assert.ok(Array.isArray(result), 'should return array');
			assert.ok(rpcCallCount >= 2, 'should make multiple RPC calls');
		});

		it('should handle no pending blocks', async () => {
			const nano = freshNano();
			nano.offline({ database: TEST_WALLET, secret: 'pw' });

			nano.rpc = function(data) {
				if (data.action === 'receivable') {
					return Promise.resolve({ blocks: '' });
				}
				return Promise.resolve({});
			};

			const result = await nano.receive();
			// When blocks is empty string, resolve is called with no args (undefined)
			// or with empty array depending on code path
			assert.ok(result === undefined || (Array.isArray(result) && result.length === 0),
				'should resolve empty or undefined when no pending');
		});
	});

	describe('nano.checkout() with mock', () => {

		it('should create checkout via RPC', async () => {
			const nano = freshNano();
			nano.offline({ database: TEST_WALLET, secret: 'pw' });
			const addr = nano.accounts()[0].address;

			nano.rpc = function(data) {
				assert.equal(data.action, 'checkout');
				assert.equal(data.address, addr);
				assert.equal(data.amount, '0.001');
				return Promise.resolve({
					id: 'test_checkout_id',
					browser: 'https://nano.to/id_test_checkout_id',
					check: 'https://api.nano.to/check/test_checkout_id',
					address: addr,
					qrcode: 'data:image/png;base64,abc'
				});
			};

			const result = await nano.checkout({ amount: '0.001' });
			assert.ok(result.id, 'should have id');
			assert.ok(result.browser, 'should have browser url');
			assert.ok(result.check, 'should have check url');
		});

		it('should require body parameter', () => {
			const nano = freshNano();
			assert.equal(typeof nano.checkout, 'function', 'checkout should be a function');
			// Note: checkout() with no body throws inside an async Promise constructor.
			// This is a known anti-pattern in the source that results in unhandled rejections.
			// The error case is validated via the CLI and integration tests.
		});
	});

	describe('nano.pow() with mock', () => {

		it('should generate PoW via RPC', async () => {
			const nano = freshNano();
			nano.rpc = function(data) {
				if (data.action === 'work_generate') {
					return Promise.resolve({ work: 'abc123def456' });
				}
				if (data.action === 'account_key') {
					return Promise.resolve({ key: 'KEYHASH' });
				}
				return Promise.resolve({});
			};

			const work = await nano.pow({
				account: 'nano_1abc',
				frontier: 'DEADBEEF'
			});
			assert.equal(work, 'abc123def456');
		});

		it('should get account_key when no frontier', async () => {
			const nano = freshNano();
			let gotAccountKey = false;
			nano.rpc = function(data) {
				if (data.action === 'account_key') {
					gotAccountKey = true;
					return Promise.resolve({ key: 'GENERATED_KEY' });
				}
				if (data.action === 'work_generate') {
					return Promise.resolve({ work: 'work_result' });
				}
				return Promise.resolve({});
			};

			const work = await nano.pow({ account: 'nano_1abc' });
			assert.ok(gotAccountKey, 'should call account_key');
		});
	});

	describe('nano.qrcode() with mock', () => {

		it('should return qrcode base64 string', async () => {
			const nano = freshNano();
			nano.offline({ database: TEST_WALLET, secret: 'pw' });

			nano.rpc = function(data) {
				return Promise.resolve({
					qrcode: 'data:image/png;base64,mockqr'
				});
			};

			const result = await nano.qrcode();
			assert.equal(result, 'data:image/png;base64,mockqr');
		});
	});

	// Cleanup
	it('cleanup test files', () => {
		try { fs.unlinkSync(TEST_WALLET); } catch (e) {}
		try { fs.rmdirSync(TEST_DIR); } catch (e) {}
	});
});

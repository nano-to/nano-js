const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

function freshNano() {
	delete require.cache[require.resolve('../nano.js')];
	return require('../nano.js');
}

const TEST_DIR = path.join(__dirname, '.tmp-changerep');
const TEST_WALLET = path.join(TEST_DIR, 'changerep_test_wallet.txt');

describe('nano.change_rep() with mocked RPC', () => {

	beforeEach(() => {
		fs.mkdirSync(TEST_DIR, { recursive: true });
		try { fs.unlinkSync(TEST_WALLET); } catch (e) {}
	});

	afterEach(() => {
		try { fs.unlinkSync(TEST_WALLET); } catch (e) {}
	});

	function setupNanoWithMock(repsResponse) {
		const nano = freshNano();
		nano.offline({ database: TEST_WALLET, secret: 'pw' });
		const wallet = nano.wallet();
		const sourceAddr = wallet.accounts[0].address;

		nano.rpc = function(data) {
			if (data.action === 'reps') {
				return Promise.resolve(repsResponse || [
					{ account: 'nano_1natrium1o3z5519ifou7xii8crpxpk8y65qmkih8e8bpsjri651oza8imdd' },
					{ account: 'nano_1kd4h9nqaxengni43xy9775gcag8ptw8ddjifnm77qes1efuoqikoqy5sjq3' },
				]);
			}
			if (data.action === 'account_info') {
				return Promise.resolve({
					balance: '5000000000000000000000000000000',
					frontier: 'AAAA000000000000000000000000000000000000000000000000000000000000',
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
				assert.equal(data.subtype, 'change', 'process subtype should be change');
				return Promise.resolve({ hash: 'CHANGE_REP_HASH_123' });
			}
			return Promise.resolve({});
		};

		return { nano, sourceAddr };
	}

	it('should change rep with explicit address', async () => {
		const { nano, sourceAddr } = setupNanoWithMock();
		const newRep = 'nano_1anrzcuwe64rwxzcco8dkhpyxpi8kd7zsjc1oeimpc3ppca4mrjtwnqposrs';

		const result = await nano.change_rep({ rep: newRep });

		assert.ok(result.hash, 'should have hash');
		assert.equal(result.representative, newRep, 'should use provided rep');
		assert.equal(result.account, sourceAddr, 'should use wallet account');
		assert.ok(result.browser, 'should have browser link');
	});

	it('should accept string shorthand (rep address directly)', async () => {
		const { nano } = setupNanoWithMock();
		const newRep = 'nano_1anrzcuwe64rwxzcco8dkhpyxpi8kd7zsjc1oeimpc3ppca4mrjtwnqposrs';

		const result = await nano.change_rep(newRep);

		assert.equal(result.representative, newRep);
		assert.ok(result.hash);
	});

	it('should auto-pick rep from reps RPC when none provided', async () => {
		const { nano } = setupNanoWithMock();

		const result = await nano.change_rep();

		assert.ok(result.hash, 'should have hash');
		assert.ok(result.representative, 'should have picked a representative');
		assert.ok(
			result.representative.startsWith('nano_'),
			'representative should be a nano address'
		);
	});

	it('should fall back to default_rep when reps RPC returns empty', async () => {
		const { nano } = setupNanoWithMock([]);

		const result = await nano.change_rep();

		assert.ok(result.hash, 'should have hash');
		assert.equal(result.representative, nano.default_rep, 'should fall back to default_rep');
	});

	it('should accept representative as alternative config key', async () => {
		const { nano } = setupNanoWithMock();
		const newRep = 'nano_1anrzcuwe64rwxzcco8dkhpyxpi8kd7zsjc1oeimpc3ppca4mrjtwnqposrs';

		const result = await nano.change_rep({ representative: newRep });

		assert.equal(result.representative, newRep);
		assert.ok(result.hash);
	});

	it('should track all RPC calls made during change_rep', async () => {
		const nano = freshNano();
		nano.offline({ database: TEST_WALLET, secret: 'pw' });

		const rpcCalls = [];
		nano.rpc = function(data) {
			rpcCalls.push(data.action);
			if (data.action === 'account_info') {
				return Promise.resolve({
					balance: '5000000000000000000000000000000',
					frontier: 'AAAA000000000000000000000000000000000000000000000000000000000000',
					representative: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou'
				});
			}
			if (data.action === 'work_generate') {
				return Promise.resolve({ work: 'c5cf86de24b24419' });
			}
			if (data.action === 'process') {
				return Promise.resolve({ hash: 'HASH_123' });
			}
			return Promise.resolve({});
		};

		await nano.change_rep({ rep: 'nano_1anrzcuwe64rwxzcco8dkhpyxpi8kd7zsjc1oeimpc3ppca4mrjtwnqposrs' });

		assert.ok(rpcCalls.includes('account_info'), 'should call account_info');
		assert.ok(rpcCalls.includes('work_generate'), 'should call work_generate');
		assert.ok(rpcCalls.includes('process'), 'should call process');
		assert.ok(!rpcCalls.includes('reps'), 'should NOT call reps when rep is provided');
	});

	it('should call reps RPC when no rep provided', async () => {
		const nano = freshNano();
		nano.offline({ database: TEST_WALLET, secret: 'pw' });

		const rpcCalls = [];
		nano.rpc = function(data) {
			rpcCalls.push(data.action);
			if (data.action === 'reps') {
				return Promise.resolve([
					{ account: 'nano_1natrium1o3z5519ifou7xii8crpxpk8y65qmkih8e8bpsjri651oza8imdd' }
				]);
			}
			if (data.action === 'account_info') {
				return Promise.resolve({
					balance: '5000000000000000000000000000000',
					frontier: 'AAAA000000000000000000000000000000000000000000000000000000000000',
					representative: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou'
				});
			}
			if (data.action === 'work_generate') {
				return Promise.resolve({ work: 'c5cf86de24b24419' });
			}
			if (data.action === 'process') {
				return Promise.resolve({ hash: 'HASH_456' });
			}
			return Promise.resolve({});
		};

		await nano.change_rep();

		assert.ok(rpcCalls.includes('reps'), 'should call reps RPC when no rep provided');
	});

	it('should require a loaded wallet', async () => {
		const nano = freshNano();
		await assert.rejects(
			() => nano.change_rep({ rep: 'nano_1abc' }),
			(err) => {
				assert.ok(
					err.message.includes('Account not found') || err.message.includes('Invalid password'),
					'should throw wallet-related error'
				);
				return true;
			}
		);
	});
});

describe('cleanup', () => {
	it('cleanup test files', () => {
		try { fs.unlinkSync(TEST_WALLET); } catch (e) {}
		try { fs.rmdirSync(TEST_DIR); } catch (e) {}
	});
});

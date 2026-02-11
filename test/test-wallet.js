const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Fresh instance for each test group
function freshNano() {
	// Clear require cache to get a fresh instance
	delete require.cache[require.resolve('../nano.js')];
	return require('../nano.js');
}

const TEST_DIR = path.join(__dirname, '.tmp-wallet');
const TEST_WALLET = path.join(TEST_DIR, 'test_wallet.txt');

describe('Wallet Management', () => {

	beforeEach(() => {
		fs.mkdirSync(TEST_DIR, { recursive: true });
		try { fs.unlinkSync(TEST_WALLET); } catch (e) {}
	});

	afterEach(() => {
		try { fs.unlinkSync(TEST_WALLET); } catch (e) {}
	});

	describe('nano.offline() / nano.app()', () => {

		it('should create a new wallet when no file exists', () => {
			const nano = freshNano();
			const wallets = nano.offline({
				database: TEST_WALLET,
				secret: 'test_password_123'
			});
			assert.ok(Array.isArray(wallets), 'should return array');
			assert.ok(wallets.length >= 1, 'should have at least 1 wallet');
			assert.ok(wallets[0].address.startsWith('nano_'), 'address should be valid');
			assert.ok(fs.existsSync(TEST_WALLET), 'wallet file should be created');
		});

		it('should load existing wallet from file', () => {
			const nano1 = freshNano();
			nano1.offline({ database: TEST_WALLET, secret: 'pw123' });
			const address1 = nano1.accounts()[0].address;

			// Load again with fresh instance
			const nano2 = freshNano();
			nano2.offline({ database: TEST_WALLET, secret: 'pw123' });
			const address2 = nano2.accounts()[0].address;

			assert.equal(address1, address2, 'should load same wallet');
		});

		it('should throw on wrong password for existing wallet', () => {
			const nano1 = freshNano();
			nano1.offline({ database: TEST_WALLET, secret: 'correct_pw' });

			const nano2 = freshNano();
			assert.throws(() => {
				nano2.offline({ database: TEST_WALLET, secret: 'wrong_pw' });
			}, 'should throw on wrong password');
		});

		it('should set endpoint from config', () => {
			const nano = freshNano();
			nano.offline({
				database: TEST_WALLET,
				secret: 'pw',
				node: 'https://custom.rpc.node'
			});
			assert.equal(nano.endpoint, 'https://custom.rpc.node');
		});

		it('should set rpc_key from config', () => {
			const nano = freshNano();
			nano.offline({
				database: TEST_WALLET,
				secret: 'pw',
				rpc_key: 'my_api_key'
			});
			assert.equal(nano.rpc_key, 'my_api_key');
		});

		it('nano.app() should be alias for nano.offline()', () => {
			const nano = freshNano();
			assert.equal(nano.app, nano.offline);
		});

		it('should accept password via "password" key', () => {
			const nano = freshNano();
			const wallets = nano.offline({
				database: TEST_WALLET,
				password: 'pw_via_password_key'
			});
			assert.ok(wallets.length >= 1);
		});

		it('should accept various filename keys', () => {
			const nano = freshNano();
			const wallets = nano.offline({
				filename: TEST_WALLET,
				secret: 'pw'
			});
			assert.ok(wallets.length >= 1);
			assert.ok(fs.existsSync(TEST_WALLET));
		});
	});

	describe('nano.accounts()', () => {

		it('should return empty array when no wallet loaded', () => {
			const nano = freshNano();
			const result = nano.accounts();
			assert.deepEqual(result, []);
		});

		it('should return wallets after offline init', () => {
			const nano = freshNano();
			nano.offline({ database: TEST_WALLET, secret: 'pw' });
			const accts = nano.accounts();
			assert.ok(accts.length >= 1);
			assert.ok(accts[0].address.startsWith('nano_'));
		});
	});

	describe('nano.add_account()', () => {

		it('should add a new account with metadata', () => {
			const nano = freshNano();
			nano.offline({ database: TEST_WALLET, secret: 'pw' });
			const initial = nano.accounts().length;

			const result = nano.add_account({ userId: 'testUser' });
			assert.ok(result);
			assert.equal(result.length, initial + 1);
			const newAcct = result.find(a => a.metadata && a.metadata.userId === 'testUser');
			assert.ok(newAcct, 'new account should have metadata');
			assert.ok(newAcct.address.startsWith('nano_'));
		});

		it('should reject duplicate metadata', () => {
			const nano = freshNano();
			nano.offline({ database: TEST_WALLET, secret: 'pw' });
			nano.add_account({ userId: 'dup' });
			const result = nano.add_account({ userId: 'dup' });
			assert.equal(result, undefined, 'should return undefined for duplicate');
		});

		it('should persist added accounts', () => {
			const nano1 = freshNano();
			nano1.offline({ database: TEST_WALLET, secret: 'pw' });
			nano1.add_account({ userId: 'persisted' });
			const count1 = nano1.accounts().length;

			const nano2 = freshNano();
			nano2.offline({ database: TEST_WALLET, secret: 'pw' });
			assert.equal(nano2.accounts().length, count1, 'account count should persist');
		});
	});

	describe('nano.import()', () => {

		it('should import a wallet object with password', () => {
			const nano = freshNano();
			const wallet = nano.generate();
			const result = nano.import(wallet, 'import_pw');
			assert.ok(result);
			assert.ok(result[0].address.startsWith('nano_'));
			assert.equal(result[0].address, wallet.accounts[0].address);
		});

		it('should import an encrypted string with password', () => {
			const nano = freshNano();
			const wallet = nano.generate();
			const encrypted = nano.encrypt(wallet, 'enc_pw');
			const result = nano.import(encrypted, 'enc_pw');
			assert.ok(result);
			assert.equal(result[0].address, wallet.accounts[0].address);
		});

		it('should return Error for non-string non-object input', () => {
			const nano = freshNano();
			const result = nano.import(12345, 'pw');
			assert.ok(result instanceof Error);
		});

		it('should return Error when password missing for encrypted string', () => {
			const nano = freshNano();
			const encrypted = nano.encrypt({ accounts: [] }, 'pw');
			const result = nano.import(encrypted);
			assert.ok(result instanceof Error);
		});
	});

	describe('nano.wallet()', () => {

		it('should return decrypted wallet data', () => {
			const nano = freshNano();
			nano.offline({ database: TEST_WALLET, secret: 'pw123' });
			const wallet = nano.wallet();
			assert.ok(wallet.seed, 'should have seed');
			assert.ok(wallet.accounts, 'should have accounts');
			assert.ok(wallet.accounts[0].private, 'should have private key');
		});

		it('should throw with wrong password', () => {
			const nano = freshNano();
			nano.offline({ database: TEST_WALLET, secret: 'correct' });
			nano.pw_cache = 'wrong';
			assert.throws(() => {
				nano.wallet();
			});
		});
	});

	describe('nano.export()', () => {

		it('should export encrypted wallet string', () => {
			const nano = freshNano();
			nano.offline({ database: TEST_WALLET, secret: 'pw' });
			const result = nano.export();
			assert.ok(result.seed, 'should return decrypted wallet');
			assert.ok(result.accounts, 'should have accounts');
		});

		it('should export raw AES string without password', () => {
			const nano = freshNano();
			nano.offline({ database: TEST_WALLET, secret: 'pw' });
			// Temporarily clear pw_cache
			const pwBackup = nano.pw_cache;
			nano.pw_cache = null;
			const raw = nano.export(null);
			assert.ok(raw.startsWith('AES-256::'), 'should be AES-256 prefixed');
			nano.pw_cache = pwBackup;
		});
	});

	describe('nano.save()', () => {

		it('should save wallet to disk', () => {
			const nano = freshNano();
			nano.offline({ database: TEST_WALLET, secret: 'pw' });

			// Modify aes256 and save
			const originalContent = fs.readFileSync(TEST_WALLET, 'utf8');
			nano.save();
			const savedContent = fs.readFileSync(TEST_WALLET, 'utf8');
			assert.ok(savedContent.length > 0, 'file should have content');
		});

		it('should use custom filename', () => {
			const customFile = path.join(TEST_DIR, 'custom_wallet.txt');
			const nano = freshNano();
			nano.offline({ database: customFile, secret: 'pw' });
			assert.ok(fs.existsSync(customFile));
			try { fs.unlinkSync(customFile); } catch (e) {}
		});
	});

	describe('nano.findAccount()', () => {

		it('should find account by index (number)', () => {
			const nano = freshNano();
			const wallet = nano.generate();
			const found = nano.findAccount(wallet, 0);
			assert.ok(found, 'should find account at index 0');
			assert.equal(found.accountIndex, 0);
		});

		it('should find account by address (string)', () => {
			const nano = freshNano();
			const wallet = nano.generate();
			const addr = wallet.accounts[0].address;
			const found = nano.findAccount(wallet, addr);
			assert.ok(found, 'should find by address');
			assert.equal(found.address, addr);
		});

		it('should find account by metadata (object)', () => {
			const nano = freshNano();
			nano.offline({ database: TEST_WALLET, secret: 'pw' });
			nano.add_account({ userId: 'findMe' });
			const wallet = nano.wallet();
			const found = nano.findAccount(wallet, { userId: 'findMe' });
			assert.ok(found, 'should find by metadata');
			assert.equal(found.metadata.userId, 'findMe');
		});

		it('should return false for non-existent account', () => {
			const nano = freshNano();
			const wallet = nano.generate();
			const found = nano.findAccount(wallet, 999);
			assert.equal(found, false);
		});

		it('should return false for non-existent address', () => {
			const nano = freshNano();
			const wallet = nano.generate();
			const found = nano.findAccount(wallet, 'nano_nonexistent');
			assert.equal(found, false);
		});

		it('should return false for non-matching metadata', () => {
			const nano = freshNano();
			const wallet = nano.generate();
			const found = nano.findAccount(wallet, { userId: 'nobody' });
			assert.equal(found, false);
		});

		it('should return false for null/undefined criteria', () => {
			const nano = freshNano();
			const wallet = nano.generate();
			assert.equal(nano.findAccount(wallet, null), false);
			assert.equal(nano.findAccount(wallet, undefined), false);
		});
	});
});

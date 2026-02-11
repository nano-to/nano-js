const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function freshNano() {
	delete require.cache[require.resolve('../nano.js')];
	return require('../nano.js');
}

// Replicate the old aes256 npm package encryption exactly
function legacyEncrypt(password, plaintext) {
	const sha256 = crypto.createHash('sha256');
	sha256.update(password);
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv('aes-256-ctr', sha256.digest(), iv);
	const ciphertext = cipher.update(plaintext, 'utf8', 'hex') + cipher.final('hex');
	return iv.toString('hex') + ':' + ciphertext;
}

const TEST_DIR = path.join(__dirname, '.tmp-legacy');
const TEST_WALLET = path.join(TEST_DIR, 'legacy_wallet.txt');

describe('Legacy v1.x Wallet Compatibility', () => {

	beforeEach(() => {
		fs.mkdirSync(TEST_DIR, { recursive: true });
		try { fs.unlinkSync(TEST_WALLET); } catch (e) {}
	});

	afterEach(() => {
		try { fs.unlinkSync(TEST_WALLET); } catch (e) {}
	});

	describe('Legacy format detection', () => {

		it('should detect legacy aes256 format (hex_iv:hex_ciphertext)', () => {
			const nano = freshNano();
			const wallet = nano.generate();
			const legacy = legacyEncrypt('password', JSON.stringify(wallet));
			// Legacy format: 32 hex chars : hex chars
			assert.ok(/^[0-9a-f]{32}:[0-9a-f]+$/i.test(legacy), 'legacy format should match pattern');
		});

		it('should NOT detect new CryptoJS format as legacy', () => {
			const nano = freshNano();
			const encrypted = nano.encrypt({ test: true }, 'pw');
			assert.ok(encrypted.startsWith('AES-256::'), 'new format should start with prefix');
			// The new format should not match legacy pattern
			assert.ok(!/^[0-9a-f]{32}:[0-9a-f]+$/i.test(encrypted));
		});
	});

	describe('nano.decrypt() — auto-detect legacy', () => {

		it('should decrypt legacy aes256 encrypted data', () => {
			const nano = freshNano();
			const original = { seed: 'abc123', accounts: [{ address: 'nano_1test' }] };
			const legacy = legacyEncrypt('mypassword', JSON.stringify(original));

			const decrypted = nano.decrypt(legacy, 'mypassword');
			assert.deepEqual(decrypted, original);
		});

		it('should decrypt new CryptoJS format', () => {
			const nano = freshNano();
			const original = { seed: 'abc123', accounts: [{ address: 'nano_1test' }] };
			const encrypted = nano.encrypt(original, 'mypassword');

			const decrypted = nano.decrypt(encrypted, 'mypassword');
			assert.deepEqual(decrypted, original);
		});

		it('should decrypt a full legacy wallet round-trip', () => {
			const nano = freshNano();
			const wallet = nano.generate();
			const legacy = legacyEncrypt('secret123', JSON.stringify(wallet));

			const decrypted = nano.decrypt(legacy, 'secret123');
			assert.equal(decrypted.seed, wallet.seed);
			assert.equal(decrypted.mnemonic, wallet.mnemonic);
			assert.equal(decrypted.accounts[0].address, wallet.accounts[0].address);
			assert.equal(decrypted.accounts[0].private, wallet.accounts[0].private);
		});

		it('should throw on wrong password for legacy format', () => {
			const nano = freshNano();
			const legacy = legacyEncrypt('correct', JSON.stringify({ test: true }));
			assert.throws(() => {
				nano.decrypt(legacy, 'wrong');
			});
		});
	});

	describe('nano.offline() — auto-migrate legacy wallet', () => {

		it('should load and auto-migrate a legacy wallet file', () => {
			const nano = freshNano();
			const wallet = nano.generate();
			const legacy = legacyEncrypt('pw123', JSON.stringify(wallet));
			fs.writeFileSync(TEST_WALLET, legacy);

			// Verify file is in legacy format
			const before = fs.readFileSync(TEST_WALLET, 'utf8');
			assert.ok(!before.startsWith('AES-256::'), 'should be legacy format before');

			// Load with offline — should auto-migrate
			const accounts = nano.offline({ database: TEST_WALLET, secret: 'pw123' });
			assert.ok(accounts.length >= 1, 'should load accounts');
			assert.equal(accounts[0].address, wallet.accounts[0].address, 'should preserve address');

			// Verify file is now in new format
			const after = fs.readFileSync(TEST_WALLET, 'utf8');
			assert.ok(after.startsWith('AES-256::'), 'should be new format after migration');
		});

		it('should load migrated wallet on second access', () => {
			const nano1 = freshNano();
			const wallet = nano1.generate();
			const legacy = legacyEncrypt('pw', JSON.stringify(wallet));
			fs.writeFileSync(TEST_WALLET, legacy);

			// First load — migrates
			nano1.offline({ database: TEST_WALLET, secret: 'pw' });
			const addr1 = nano1.accounts()[0].address;

			// Second load — reads new format
			const nano2 = freshNano();
			nano2.offline({ database: TEST_WALLET, secret: 'pw' });
			const addr2 = nano2.accounts()[0].address;

			assert.equal(addr1, addr2, 'should load same wallet after migration');
		});

		it('should preserve all accounts during migration', () => {
			const nano = freshNano();
			const wallet = nano.generate();
			// Add extra accounts to the wallet
			const extraAcct = { accountIndex: 1, address: 'nano_extra', private: 'key', metadata: { userId: 'joe' } };
			wallet.accounts.push(extraAcct);

			const legacy = legacyEncrypt('pw', JSON.stringify(wallet));
			fs.writeFileSync(TEST_WALLET, legacy);

			nano.offline({ database: TEST_WALLET, secret: 'pw' });
			const accounts = nano.accounts();
			assert.equal(accounts.length, 2, 'should have 2 accounts');
			assert.ok(accounts[1].metadata, 'should preserve metadata');
			assert.equal(accounts[1].metadata.userId, 'joe');
		});
	});

	describe('nano.import() — legacy format', () => {

		it('should import a legacy encrypted string', () => {
			const nano = freshNano();
			const wallet = nano.generate();
			const legacy = legacyEncrypt('pw', JSON.stringify(wallet));

			const result = nano.import(legacy, 'pw');
			assert.ok(result.length >= 1);
			assert.equal(result[0].address, wallet.accounts[0].address);
		});

		it('should re-encrypt imported legacy wallet in new format', () => {
			const nano = freshNano();
			const wallet = nano.generate();
			const legacy = legacyEncrypt('pw', JSON.stringify(wallet));

			nano.import(legacy, 'pw');
			// Internal aes256 should now be in new format
			assert.ok(nano.aes256.startsWith('AES-256::'), 'should store in new format');
		});
	});

	describe('nano.migrate()', () => {

		it('should migrate a legacy wallet file in place', () => {
			const nano = freshNano();
			const wallet = nano.generate();
			const legacy = legacyEncrypt('pw', JSON.stringify(wallet));
			fs.writeFileSync(TEST_WALLET, legacy);

			const result = nano.migrate({ database: TEST_WALLET, secret: 'pw' });
			assert.equal(result.migrated, true);
			assert.ok(result.accounts >= 1);

			const content = fs.readFileSync(TEST_WALLET, 'utf8');
			assert.ok(content.startsWith('AES-256::'));
		});

		it('should report already-migrated wallet', () => {
			const nano = freshNano();
			const encrypted = nano.encrypt({ seed: 'x', accounts: [{}] }, 'pw');
			fs.writeFileSync(TEST_WALLET, encrypted);

			const result = nano.migrate({ database: TEST_WALLET, secret: 'pw' });
			assert.equal(result.migrated, false);
			assert.ok(result.message.includes('already'));
		});

		it('should return error for missing file', () => {
			const nano = freshNano();
			const result = nano.migrate({ database: '/tmp/nonexistent_wallet.txt', secret: 'pw' });
			assert.ok(result instanceof Error);
		});

		it('should return error for missing password', () => {
			const nano = freshNano();
			const result = nano.migrate({ database: TEST_WALLET });
			assert.ok(result instanceof Error);
		});

		it('should return error for missing config', () => {
			const nano = freshNano();
			const result = nano.migrate();
			assert.ok(result instanceof Error);
		});
	});
});

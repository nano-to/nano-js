const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CLI = path.join(__dirname, '..', 'bin', 'nano-wallet.js');
const TEST_DIR = path.join(__dirname, '.tmp-cli');

function run(args, opts = {}) {
	try {
		const result = execSync(`node "${CLI}" ${args} 2>&1`, {
			encoding: 'utf8',
			timeout: 15000,
			...opts
		});
		return { stdout: result, exitCode: 0 };
	} catch (e) {
		return { stdout: e.stdout || '', stderr: e.stderr || e.stdout || '', exitCode: e.status };
	}
}

describe('CLI: offline commands', () => {

	beforeEach(() => {
		fs.mkdirSync(TEST_DIR, { recursive: true });
	});

	afterEach(() => {
		// Clean up test files
		try {
			const files = fs.readdirSync(TEST_DIR);
			for (const f of files) fs.unlinkSync(path.join(TEST_DIR, f));
		} catch (e) {}
	});

	describe('encrypt/decrypt', () => {

		it('should encrypt a file', () => {
			const testFile = path.join(TEST_DIR, 'plaintext.json');
			fs.writeFileSync(testFile, '{"test":"data","num":42}');
			const { stdout } = run(`encrypt "${testFile}" mypassword`);
			assert.ok(stdout.includes('AES-256::'), 'should output AES-256 encrypted string');
		});

		it('should decrypt an encrypted file', () => {
			// First encrypt
			const testFile = path.join(TEST_DIR, 'plaintext2.json');
			fs.writeFileSync(testFile, '{"test":"roundtrip"}');
			const { stdout: encrypted } = run(`encrypt "${testFile}" testpw`);

			// Write encrypted to file
			const encFile = path.join(TEST_DIR, 'encrypted.txt');
			fs.writeFileSync(encFile, encrypted.trim());

			const { stdout: decrypted } = run(`decrypt "${encFile}" testpw`);
			const parsed = JSON.parse(decrypted.trim());
			assert.equal(parsed.test, 'roundtrip');
		});

		it('should show error when file missing for encrypt', () => {
			const { stdout } = run('encrypt');
			assert.ok(stdout.includes('Usage'), 'should show usage');
		});

		it('should show error when file missing for decrypt', () => {
			const { stdout } = run('decrypt');
			assert.ok(stdout.includes('Usage'), 'should show usage');
		});
	});

	describe('generate', () => {

		it('should require --secret', () => {
			const { stdout } = run('generate');
			assert.ok(stdout.includes('password required'));
		});

		it('should generate and save wallet file', () => {
			const walletPath = path.join(TEST_DIR, 'test-wallet.dat');
			const { stdout } = run(`generate --secret testpw --wallet "${walletPath}"`);
			assert.ok(stdout.includes('Wallet saved'), 'should confirm save');
			assert.ok(stdout.includes('Address:'), 'should show address');
			assert.ok(stdout.includes('Mnemonic:'), 'should show mnemonic');
			assert.ok(fs.existsSync(walletPath), 'wallet file should exist');
		});

		it('should refuse to overwrite existing wallet', () => {
			const walletPath = path.join(TEST_DIR, 'existing-wallet.dat');
			run(`generate --secret testpw --wallet "${walletPath}"`);
			const { stdout } = run(`generate --secret testpw --wallet "${walletPath}"`);
			assert.ok(stdout.includes('already exists'));
		});

		it('should output JSON with --json flag', () => {
			const walletPath = path.join(TEST_DIR, 'json-wallet.dat');
			const { stdout } = run(`generate --secret testpw --wallet "${walletPath}" --json`);
			assert.ok(stdout.includes('Wallet saved'));
			// JSON output comes after the human-readable lines
			const jsonStart = stdout.indexOf('{');
			const json = JSON.parse(stdout.slice(jsonStart));
			assert.ok(json.mnemonic, 'should have mnemonic');
			assert.ok(json.accounts[0].address.startsWith('nano_'), 'should have address');
		});
	});

	describe('send', () => {

		it('should show error on missing args', () => {
			const { stdout } = run('send');
			assert.ok(stdout.includes('Usage'));
		});

		it('should show error when only to address provided', () => {
			const { stdout } = run('send nano_1abc');
			assert.ok(stdout.includes('Usage'));
		});

		it('should show error when wallet password missing', () => {
			const { stdout } = run('send nano_1abc 0.001');
			assert.ok(stdout.includes('wallet password required'));
		});

		it('should show error when wallet file not found', () => {
			const { stdout } = run('send nano_1abc 0.001 --secret testpw --wallet /tmp/nonexistent.dat');
			assert.ok(stdout.includes('wallet file not found'));
		});
	});

	describe('receive', () => {

		it('should show error when wallet password missing', () => {
			const { stdout } = run('receive');
			assert.ok(stdout.includes('wallet password required'));
		});

		it('should show error when wallet file not found', () => {
			const { stdout } = run('receive --secret testpw --wallet /tmp/nonexistent.dat');
			assert.ok(stdout.includes('wallet file not found'));
		});
	});

	describe('balance / account_info with wallet', () => {

		it('should load address from wallet for balance', () => {
			const walletPath = path.join(TEST_DIR, 'balance-wallet.dat');
			run(`generate --secret testpw --wallet "${walletPath}"`);
			// balance without explicit address should load from wallet
			// It will error on RPC (no network in test), but should not error on "missing address"
			const { stdout } = run(`balance --secret testpw --wallet "${walletPath}"`);
			// Should attempt an RPC call (may fail), but should NOT show "address required"
			assert.ok(!stdout.includes('address required'), 'should not require address when wallet loaded');
		});

		it('should still accept explicit address for balance', () => {
			const { stdout } = run('balance nano_1natrium1o3z5519ifou7xii8crpxpk8y65qmkih8e8bpsjri651oza8imdd');
			// May succeed or fail depending on network, but should not ask for wallet
			assert.ok(stdout, 'should produce output');
		});
	});
});

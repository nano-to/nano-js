const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CLI = path.join(__dirname, '..', 'bin', 'nano-wallet.js');
const TEST_DIR = path.join(__dirname, '.tmp-cli');

function run(args) {
	try {
		const result = execSync(`node "${CLI}" ${args} 2>&1`, {
			encoding: 'utf8',
			timeout: 15000
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

	describe('account_info', () => {

		it('should show error on missing address', () => {
			const { stdout } = run('account_info');
			assert.ok(stdout.includes('address required'));
		});
	});

	describe('receive', () => {

		it('should show error on missing address', () => {
			const { stdout } = run('receive');
			assert.ok(stdout.includes('address required'));
		});
	});

	describe('send', () => {

		it('should show error on missing args', () => {
			const { stdout } = run('send');
			assert.ok(stdout.includes('Usage'));
		});

		it('should show error with partial args', () => {
			const { stdout } = run('send nano_1abc');
			assert.ok(stdout.includes('Usage'));
		});
	});
});

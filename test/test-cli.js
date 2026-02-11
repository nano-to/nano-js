const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('child_process');
const path = require('path');

const LIVE = !process.env.CI;

const CLI = path.join(__dirname, '..', 'bin', 'nano-wallet.js');

function run(args, opts = {}) {
	try {
		const result = execSync(`node "${CLI}" ${args} 2>&1`, {
			encoding: 'utf8',
			timeout: 15000,
			...opts
		});
		return { stdout: result, stderr: '', exitCode: 0 };
	} catch (e) {
		return { stdout: e.stdout || '', stderr: e.stderr || e.stdout || '', exitCode: e.status };
	}
}

describe('CLI: nano-wallet', () => {

	describe('help', () => {

		it('should show help with --help flag', () => {
			const { stdout } = run('--help');
			assert.ok(stdout.includes('@nano/wallet CLI'), 'should show title');
			assert.ok(stdout.includes('Commands:'), 'should show commands');
			assert.ok(stdout.includes('generate'), 'should mention generate');
			assert.ok(stdout.includes('balance'), 'should mention balance');
			assert.ok(stdout.includes('rpc'), 'should mention rpc');
			assert.ok(stdout.includes('convert'), 'should mention convert');
		});

		it('should show help with -h flag', () => {
			const { stdout } = run('-h');
			assert.ok(stdout.includes('@nano/wallet CLI'));
		});

		it('should show help with no arguments', () => {
			const { stdout } = run('');
			assert.ok(stdout.includes('@nano/wallet CLI'));
		});

		it('should show help with help command', () => {
			const { stdout } = run('help');
			assert.ok(stdout.includes('@nano/wallet CLI'));
		});
	});

	describe('generate', () => {

		it('should generate a wallet', () => {
			const { stdout } = run('generate');
			const wallet = JSON.parse(stdout);
			assert.ok(wallet.mnemonic, 'should have mnemonic');
			assert.ok(wallet.seed, 'should have seed');
			assert.ok(wallet.accounts, 'should have accounts');
			assert.ok(wallet.accounts[0].address.startsWith('nano_'), 'should have valid address');
			assert.ok(wallet.accounts[0].private, 'should have private key');
		});

		it('should generate unique wallets', () => {
			const { stdout: s1 } = run('generate');
			const { stdout: s2 } = run('generate');
			const w1 = JSON.parse(s1);
			const w2 = JSON.parse(s2);
			assert.notEqual(w1.seed, w2.seed);
		});
	});

	describe('convert', () => {

		it('should convert NANO to RAW', () => {
			const { stdout } = run('convert 1 NANO RAW');
			assert.equal(stdout.trim(), '1000000000000000000000000000000');
		});

		it('should convert RAW to NANO', () => {
			const { stdout } = run('convert 1000000000000000000000000000000 RAW NANO');
			assert.equal(parseFloat(stdout.trim()), 1);
		});

		it('should convert fractional amounts', () => {
			const { stdout } = run('convert 0.5 NANO RAW');
			assert.equal(stdout.trim(), '500000000000000000000000000000');
		});

		it('should show error on missing args', () => {
			const { stdout, stderr } = run('convert 1');
			const output = stderr || stdout;
			assert.ok(output.includes('Usage'), 'should show usage hint');
		});
	});

	describe('rpc', () => {

		it('should call block_count on rpc.nano.to', { skip: !LIVE && 'Skipped in CI (rate limits)' }, () => {
			const { stdout } = run('rpc block_count');
			const result = JSON.parse(stdout);
			assert.ok(result.count, 'should have count');
			assert.ok(parseInt(result.count) > 100000000);
		});

		it('should pass key=value params', { skip: !LIVE && 'Skipped in CI (rate limits)' }, () => {
			const { stdout } = run('rpc account_info account=nano_1natrium1o3z5519ifou7xii8crpxpk8y65qmkih8e8bpsjri651oza8imdd');
			const result = JSON.parse(stdout);
			// Should either have balance or error (account might not exist)
			assert.ok(result);
		});

		it('should show error on missing action', () => {
			const { stdout, stderr } = run('rpc');
			const output = stderr || stdout;
			assert.ok(output.includes('action required'));
		});
	});

	describe('balance', () => {

		it('should show error on missing address', () => {
			const { stdout, stderr } = run('balance');
			const output = stderr || stdout;
			assert.ok(output.includes('address required'));
		});

		it('should get balance for a known address', { skip: !LIVE && 'Skipped in CI (rate limits)' }, () => {
			const { stdout } = run('balance nano_1natrium1o3z5519ifou7xii8crpxpk8y65qmkih8e8bpsjri651oza8imdd');
			const result = JSON.parse(stdout);
			assert.ok(result.balance !== undefined || result.error, 'should have balance or error');
		});
	});

	describe('unknown command', () => {

		it('should show error for unknown command', () => {
			const { stderr, exitCode } = run('foobar');
			assert.ok(stderr.includes('Unknown command'));
			assert.equal(exitCode, 1);
		});
	});
});

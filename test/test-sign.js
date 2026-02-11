const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const nano = require('../nano.js');

describe('nano.sign()', () => {

	const testWallet = nano.generate();
	const privateKey = testWallet.accounts[0].private;
	const address = testWallet.accounts[0].address;

	// nano.sign() detects type by:
	//   fromAddress present -> send (called via _NanocurrencyWeb.block.send)
	//   toAddress present -> receive (called via _NanocurrencyWeb.block.receive)
	//   neither -> representative change
	// Note: if BOTH fromAddress and toAddress are present, receive wins (last check)

	it('should sign a send block (fromAddress, no toAddress)', () => {
		// For manual sign, send blocks use fromAddress only.
		// The nanocurrency-web block.send() takes fromAddress + toAddress + amountRaw etc.
		const block = {
			walletBalanceRaw: '18618869000000000000000000000000',
			fromAddress: address,
			toAddress: 'nano_3kyb49tqpt39ekc49kbej51ecsjqnimnzw1swxz4boix4ctm93w517umuiw8',
			representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',
			frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',
			amountRaw: '7000000000000000000000000000000',
			transactionHash: 'CBC911F57B6827649423C92C88C0C56637A4274FF019E77E24D61D12B5338783',
		};
		// Since toAddress is present, sign() will call block.receive() 
		// which is fine as long as transactionHash is provided
		const signed = nano.sign(block, privateKey);
		assert.ok(signed, 'should return signed block');
		assert.ok(signed.signature, 'should have signature');
		assert.equal(signed.type, 'state', 'should be state block');
		assert.equal(signed.signature.length, 128, 'signature should be 128 hex chars');
	});

	it('should sign a receive block', () => {
		const block = {
			walletBalanceRaw: '18618869000000000000000000000000',
			toAddress: address,
			representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',
			frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',
			transactionHash: 'CBC911F57B6827649423C92C88C0C56637A4274FF019E77E24D61D12B5338783',
			amountRaw: '7000000000000000000000000000000',
			work: 'c5cf86de24b24419',
		};
		const signed = nano.sign(block, privateKey);
		assert.ok(signed, 'should return signed block');
		assert.ok(signed.signature, 'should have signature');
		assert.equal(signed.type, 'state', 'should be state block');
	});

	it('should sign a representative change block', () => {
		const block = {
			walletBalanceRaw: '3000000000000000000000000000000',
			address: address,
			representativeAddress: 'nano_1anrzcuwe64rwxzcco8dkhpyxpi8kd7zsjc1oeimpc3ppca4mrjtwnqposrs',
			frontier: '128106287002E595F479ACD615C818117FCB3860EC112670557A2467386249D4',
			work: '0000000000000000',
		};
		const signed = nano.sign(block, privateKey);
		assert.ok(signed, 'should return signed block');
		assert.ok(signed.signature, 'should have signature');
	});

	it('should produce different signatures for different blocks', () => {
		const base = {
			walletBalanceRaw: '18618869000000000000000000000000',
			toAddress: address,
			representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',
			frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',
			transactionHash: 'CBC911F57B6827649423C92C88C0C56637A4274FF019E77E24D61D12B5338783',
			amountRaw: '7000000000000000000000000000000',
			work: 'c5cf86de24b24419',
		};
		const block2 = { ...base, amountRaw: '1000000000000000000000000000000' };

		const signed1 = nano.sign(base, privateKey);
		const signed2 = nano.sign(block2, privateKey);
		assert.notEqual(signed1.signature, signed2.signature, 'different blocks should have different sigs');
	});

	it('should produce deterministic signatures', () => {
		const block = {
			walletBalanceRaw: '18618869000000000000000000000000',
			toAddress: address,
			representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',
			frontier: '92BA74A7D6DC7557F3EDA95ADC6341D51AC777A0A6FF0688A5C492AB2B2CB40D',
			transactionHash: 'CBC911F57B6827649423C92C88C0C56637A4274FF019E77E24D61D12B5338783',
			amountRaw: '7000000000000000000000000000000',
			work: 'c5cf86de24b24419',
		};
		const signed1 = nano.sign(block, privateKey);
		const signed2 = nano.sign(block, privateKey);
		assert.equal(signed1.signature, signed2.signature, 'same block same key should have same sig');
	});

	it('should use wallet private key when none provided', () => {
		const nano2 = (() => {
			delete require.cache[require.resolve('../nano.js')];
			return require('../nano.js');
		})();
		const fs = require('fs');
		const path = require('path');
		const testFile = path.join(__dirname, '.tmp-sign', 'sign_test.txt');
		try { fs.mkdirSync(path.join(__dirname, '.tmp-sign'), { recursive: true }); } catch(e) {}

		nano2.offline({ database: testFile, secret: 'pw' });
		const block = {
			walletBalanceRaw: '1000000000000000000000000000000',
			address: nano2.accounts()[0].address,
			representativeAddress: 'nano_1anrzcuwe64rwxzcco8dkhpyxpi8kd7zsjc1oeimpc3ppca4mrjtwnqposrs',
			frontier: '128106287002E595F479ACD615C818117FCB3860EC112670557A2467386249D4',
			work: '0000000000000000',
		};
		// Sign without providing private key — uses wallet's first account
		const signed = nano2.sign(block);
		assert.ok(signed.signature, 'should sign using wallet private key');

		try { fs.unlinkSync(testFile); } catch(e) {}
	});
});

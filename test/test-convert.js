const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const nano = require('../nano.js');

describe('nano.convert()', () => {

	it('should convert 1 NANO to RAW', () => {
		const result = nano.convert('1', 'NANO', 'RAW');
		assert.equal(result, '1000000000000000000000000000000');
	});

	it('should convert RAW to NANO', () => {
		const result = nano.convert('1000000000000000000000000000000', 'RAW', 'NANO');
		assert.equal(parseFloat(result), 1, 'should equal 1 NANO');
		assert.ok(result.startsWith('1'), 'should start with 1');
	});

	it('should convert fractional NANO to RAW', () => {
		const result = nano.convert('0.001', 'NANO', 'RAW');
		assert.equal(result, '1000000000000000000000000000');
	});

	it('should convert large RAW to NANO', () => {
		const result = nano.convert('1500000000000000000000000000000', 'RAW', 'NANO');
		assert.equal(parseFloat(result), 1.5, 'should equal 1.5 NANO');
	});

	it('should handle zero', () => {
		const result = nano.convert('0', 'NANO', 'RAW');
		assert.equal(result, '0');
	});

	it('should convert very small amounts', () => {
		const result = nano.convert('1', 'RAW', 'NANO');
		assert.ok(result.includes('0.'), 'should be a very small decimal');
	});

	it('should handle large NANO values', () => {
		const result = nano.convert('1000000', 'NANO', 'RAW');
		assert.ok(result.length > 30, 'should be a very large number');
	});

	it('should be reversible', () => {
		const raw = nano.convert('3.14159', 'NANO', 'RAW');
		const nano_back = nano.convert(raw, 'RAW', 'NANO');
		assert.equal(parseFloat(nano_back), 3.14159, 'should round-trip to same value');
	});
});

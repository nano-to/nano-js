const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const nano = require('../nano.js')

function payment() {
	return { id: 'pay_123', check: 'https://rpc.nano.to/check/pay_123' }
}

describe('Payment monitor client API', () => {
	it('creates a payment request without mutating caller options', async () => {
		const original = nano.checkout
		const body = { amount: '0.001', metadata: { order_id: 'order-1' } }
		let received
		nano.checkout = async value => {
			received = Object.assign({}, value)
			value.action = 'checkout'
			return { id: 'pay_123' }
		}

		try {
			const result = await nano.paymentRequest(body)
			assert.deepEqual(result, { id: 'pay_123' })
			assert.deepEqual(received, {
				amount: '0.001',
				metadata: { order_id: 'order-1' },
				payment_monitor: true
			})
			assert.deepEqual(body, { amount: '0.001', metadata: { order_id: 'order-1' } })
		} finally {
			nano.checkout = original
		}
	})

	it('normalizes pending, confirmed, and expired status', async () => {
		const original = nano.get
		const responses = [
			{ error: 404, message: 'Payment not found.' },
			{ status: 'complete', block: { hash: 'ABC' } },
			{ error: 400, expired: true, message: 'Expired checkout.' }
		]
		nano.get = async () => responses.shift()

		try {
			assert.equal((await nano.getPaymentStatus(payment())).state, 'pending')
			assert.equal((await nano.getPaymentStatus(payment())).state, 'confirmed')
			assert.equal((await nano.getPaymentStatus(payment())).state, 'expired')
		} finally {
			nano.get = original
		}
	})

	it('monitors until confirmation and reports state changes once', async () => {
		const original = nano.getPaymentStatus
		const states = ['pending', 'pending', 'confirmed']
		const seen = []
		nano.getPaymentStatus = async () => ({ state: states.shift() })

		try {
			const result = await nano.monitorPayment(payment(), {
				interval: 100,
				onStatus: status => seen.push(status.state)
			})
			assert.equal(result.state, 'confirmed')
			assert.deepEqual(seen, ['pending', 'confirmed'])
		} finally {
			nano.getPaymentStatus = original
		}
	})

	it('supports timeout and AbortSignal cancellation', async () => {
		const original = nano.getPaymentStatus
		nano.getPaymentStatus = async () => ({ state: 'pending' })

		try {
			await assert.rejects(
				nano.monitorPayment(payment(), { interval: 100, timeout: 120 }),
				error => error.code === 'PAYMENT_MONITOR_TIMEOUT'
			)

			const controller = new AbortController()
			const pending = nano.monitorPayment(payment(), { interval: 100, signal: controller.signal })
			setTimeout(() => controller.abort(), 10)
			await assert.rejects(pending, error => error.code === 'ABORT_ERR')
		} finally {
			nano.getPaymentStatus = original
		}
	})
})

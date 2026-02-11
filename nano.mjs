// @nano/wallet - ESM wrapper
// Usage: import nano from '@nano/wallet'

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const nano = require('./nano.js');

export default nano;

export const generate = nano.generate.bind(nano);
export const convert = nano.convert;
export const accounts = nano.accounts.bind(nano);
export const add_account = nano.add_account.bind(nano);
export const wallet = nano.wallet.bind(nano);
export const save = nano.save.bind(nano);
export const offline = nano.offline.bind(nano);
export const app = nano.app.bind(nano);
export const rpc = nano.rpc.bind(nano);
export const get = nano.get.bind(nano);
export const send = nano.send.bind(nano);
export const receive = nano.receive.bind(nano);
export const balances = nano.balances.bind(nano);
export const balance = nano.balance.bind(nano);
export const pending = nano.pending.bind(nano);
export const checkout = nano.checkout.bind(nano);
export const confirm = nano.confirm.bind(nano);
export const waitFor = nano.waitFor.bind(nano);
export const qrcode = nano.qrcode.bind(nano);
export const pow = nano.pow.bind(nano);
export const block = nano.block;
export const sign = nano.sign.bind(nano);
export const tools = nano.tools;
export const encrypt = nano.encrypt;
export const decrypt = nano.decrypt;
export const findAccount = nano.findAccount.bind(nano);

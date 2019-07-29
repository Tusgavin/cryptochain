// get the global value by destructing the object exported - see config.js
const { STARTING_BALANCE } = require('../config');
// Disclaimer: if you are using jest in a node environment, you must specify it in package.json
const { ec, cryptoHash } = require('../utils');
const Transaction = require('./transaction');

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();

        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({ amount, recipient }) {
        if(amount > this.balance) {
            throw new Error('Amount excedes balance');
        }

        return new Transaction({ senderWallet: this, recipient, amount });
    }
};

module.exports = Wallet;
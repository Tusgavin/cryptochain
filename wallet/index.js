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

    createTransaction({ amount, recipient, chain }) {
        if(chain) {
            this.balance = Wallet.calculateBalance({ chain, address: this.publicKey });
        }

        if(amount > this.balance) {
            throw new Error('Amount excedes balance');
        }

        return new Transaction({ senderWallet: this, recipient, amount });
    }

    static calculateBalance({ chain, address }) {
        let hasConductedTransaction = false;
        let outputsTotal = 0;

        for(let aux = chain.length - 1; aux > 0; aux--) {
            const block = chain[aux];

            for(let transaction of block.data) {
                if(transaction.input.address === address) {
                    hasConductedTransaction = true;
                } 

                const addressOutput = transaction.outputMap[address];

                // if there are outputs for the wallet
                if(addressOutput) {
                    outputsTotal = outputsTotal + addressOutput;
                }
            }

            if(hasConductedTransaction) {
                break;
            }
        }

        // if hasConductedTransaction is true return outputsTotal, else, return STARTING_BALANCE + outputsTotal
        return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
    }
};

module.exports = Wallet; 
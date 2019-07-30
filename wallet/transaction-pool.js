const Transaction = require('./transaction');

class TransactionPool {
    constructor() {
        this.transactionMap = {};
    }

    clear() {
        this.transactionMap = {};        
    }

    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction;
    }

    setMap(transactionMap) {
        this.transactionMap = transactionMap;
    }

    existingTransaction({ inputAddress }) {
        const transactions = Object.values(this.transactionMap);

        return transactions.find((transaction) => transaction.input.address === inputAddress);
    }

    validTransactions() {
        // Filter the valid transactions in the pool
        return Object.values(this.transactionMap).filter(transaction => Transaction.validTransaction(transaction));
    }

    clearBlockchainTransactions({ chain }) {
        for(let aux = 1; aux < chain.length; aux++) {
            const block = chain[aux];

            for(let transaction of block.data) {
                if(this.transactionMap[transaction.id]) {
                    delete this.transactionMap[transaction.id];
                }
            }
        }
    }
}

module.exports = TransactionPool;
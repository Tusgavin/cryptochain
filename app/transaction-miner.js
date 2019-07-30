const Transaction = require('../wallet/transaction');

class TransactionMiner {
    constructor({ blockchain, transactionPool, wallet, pubsub }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mineTransaction() {
        // get the transaction pool's valid transaction
        const validTransactions = this.transactionPool.validTransactions();
        
        // generates the miner's reward and adds as a valid transaction
        validTransactions.push(Transaction.rewardTransaction({ minerWallet: this.wallet }));

        // add a block consisting of these transaction to the blockchain
        this.blockchain.addBlock({ data: validTransactions });

        // broadcast the updated blockchain
        this.pubsub.broadcastChain();

        // clear the transaction pool
        this.transactionPool.clear();
    }
}

module.exports = TransactionMiner;
class TransactionMiner {
    constructor({ blockcahin, transactionPool, wallet, pubsub }) {
        this.blockcahin = blockcahin;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mineTransaction() {
        // get the transaction pool's valid transaction
        
        // generates the miner's reward

        // add a block consisting of these transaction to the blockchain

        // broadcast the updated blockchain

        // clear the transaction pool
    }
}

module.exports = TransactionMiner;
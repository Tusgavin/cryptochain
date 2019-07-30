// require express
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');

// creating an application object
const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool, wallet });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;


// basically tells the system that you want json to be used
app.use(bodyParser.json());

// define GET request to get all the blocks from the blockchain
app.get('/api/blocks', (req, res) => {
    // send back the blockchain.chain in its json form
    res.json(blockchain.chain);
});

// define POST to add blocks to the chain
app.post('/api/mine', (req, res) => {
    const { data } = req.body;

    blockchain.addBlock({ data });

    // broadcast to all parties
    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    const { amount, recipient } = req.body;

    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });

    // handling invalid transactions and updates
    try {
        if(transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount });
        } else {
            transaction = wallet.createTransaction({ amount, recipient });
        }
    } catch(error) {
        // the 'return' will make sure the rest of the code in the method will not be executed
        return res.status(400).json({ type: 'error', message: error.message });
    }

    transactionPool.setTransaction(transaction);

    // broadcast to all parties
    pubsub.broadcastTransaction(transaction);

    res.json({ type: 'success', transaction });
});

app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransaction();

    res.redirect('/api/blocks');
});

// when started a new peer, make sure to sync it with the root chain
const syncWithRootState = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        // TCP protocol, default reponse status === 200
        if(!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);

            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
        if(!error && response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body);

            console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
};

let PEER_PORT;

// make sure peers listen on different ports
if(process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

// if PEER_PORT doesn't have a value, use DEFAULT_PORT
const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening on port: ${ PORT }`);

    // if PORT == DEFAULT_PORT, it is a redundant action to sync it
    if(PORT !== DEFAULT_PORT) {
        syncWithRootState();   
    }
});
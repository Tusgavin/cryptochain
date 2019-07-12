// require express
const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PubSub = require('./pubsub');

// creating an application object
const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

setTimeout(() => pubsub.broadcastChain(), 1000);

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

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

const DEFAULT_PORT = 3000;
let PEER_PORT;

// make sure peers listen on different ports
if(process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

// if PEER_PORT doesn't have a value, use DEFAULT_PORT
const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => console.log(`listening on port: ${ PORT }`));
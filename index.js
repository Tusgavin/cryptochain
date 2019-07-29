// require express
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');

// creating an application object
const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

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

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

// when started a new peer, make sure to sync it with the root chain
const syncChains = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks `}, (error, reponse, body) => {
        // TCP protocol, default reponse status === 200
        if(!error && reponse.statusCode === 200) {
            const rootChain = JSON.parse(body);

            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
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
        syncChains();   
    }
});
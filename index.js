// require express
const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');

// creating an application object
const app = express();
const blockchain = new Blockchain();

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

    res.redirect('/api/blocks');
});

// listening on port 3000
const PORT = 3000;
app.listen(PORT, () => console.log(`listening on port: ${ PORT }`));
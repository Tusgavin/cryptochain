const Block = require('./block');
const { cryptoHash } = require('../utils');

class Blockchain {
    constructor() {
        // creates the chain with the genesis block
        this.chain = [Block.genesis()];
    }

    addBlock({ data }) {
        // create a new mined block
        const newBlock = Block.mineBlock({ lastBlock: this.chain[this.chain.length-1], data: data });

        // push the mined block into the chain
        this.chain.push(newBlock);
    }

    static isValidChain(chain) {
        // two objects can never be triple-equal unless they are the same underlying object
        // instance   
        // so, we use JSON.stringfy() to transform the properties of an object to JSON string
        // now, they are from the same instance and we can compare them
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        for(let i = 1; i < chain.length; i++) {
            // get properties from a block
            const { timestamp, lastHash, hash, nonce, difficulty, data } = chain[i];
            // get real hash from lastBlock
            const actualLastHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;

            // compare the hash of the lastBlock with the lastHash from the current block
            if(lastHash !== actualLastHash) {
                return false;
            }

            // created a hash with the properties given
            const validatedHash = cryptoHash(timestamp, lastHash, nonce, difficulty, data);

            // check if the hash is valid (sha256 generates same hash to same inputs)
            if(hash !== validatedHash) {
                return false;
            }

            // protects difficulty jumps so the difficulty does not get too low or too high
            if(Math.abs(lastDifficulty - difficulty > 1)) {
                return false;
            }
        }
        
        return true;
    }

    // Not static because it's based in a individual instance that is going to be replaced
    replaceChain(chain, onSuccess) {
        // check length of the new chain
        if(chain.length <= this.chain.length) {
            console.error('new chain must be longer!');
            return;
        }

        // check validity of new chain
        if(!Blockchain.isValidChain(chain)) {
            console.error('new chain must be valid!');
            return;
        }

        if(onSuccess) onSuccess();

        console.log('replacing cahin with', chain);
        // replace the chain if everything is correct
        this.chain = chain;
    }
}

// exporting class
module.exports = Blockchain;
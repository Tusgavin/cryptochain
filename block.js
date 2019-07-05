const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require('./config');
const cryptoHash = require('./crypto-hash');


// creation of Block class
class Block {
    // creates a block with the given properties 
    constructor({timestamp, hash, lastHash, data, nonce, difficulty}) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    // static func can be called without an instance of the class
    // creates genesis block with the data in the global value GENESIS_BLOCK
    static genesis() {
        return new Block(GENESIS_DATA);
    }

    static mineBlock({ lastBlock, data}) {
        let hash, timestamp;

        // get lastHash
        const lastHash = lastBlock.hash;
        // get difficulty from previous block
        let { difficulty } = lastBlock;
        // create nonce variable
        let nonce = 0;

        // create a loop to generate hashes for different nonce values until matches the difficulty criteria
        do {
            nonce++;
            // get the time
            timestamp = Date.now();
            // adjust difficulty for each loop
            difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp });
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

        } while(hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));
        // in this while, the hash is converted to binary

        return new Block({
            timestamp: timestamp,
            lastHash: lastHash,
            data: data,
            nonce: nonce,
            difficulty: difficulty,
            hash: hash
        });
    }

    static adjustDifficulty({ originalBlock, timestamp }) {
        // extract the difficulty from originalBlock
        const { difficulty } = originalBlock;

        if(difficulty < 1) {
            return 1;
        }

        // compare if the blocktimestamp is higher or lower than the MINE_RATE
        if(( timestamp - originalBlock.timestamp) > MINE_RATE) {
            return difficulty - 1;
        }

        return difficulty + 1;
    }
};

// export class Block so it can be used in other files e.g test file
module.exports = Block;

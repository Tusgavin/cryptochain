const hexToBinary = require('hex-to-binary');
// require the block class from another file
const Block = require('./block');
// require the object GENESIS_DATA
const { GENESIS_DATA, MINE_RATE } = require('./config');
// require the function cryptoHash
const cryptoHash = require('./crypto-hash');

// testing Block class
describe('Block', () => {
    // declaring variables
    const timestamp = 2000;
    const lastHash = 'foo-lastHash';
    const hash = 'foo-hash';
    const data = ['blockchain', 'foo-data'];
    const nonce = 1;
    const difficulty = 1;

    // creating object
    const block = new Block({
        timestamp: timestamp,
        lastHash: lastHash,
        hash: hash,
        data: data,
        nonce: nonce,
        difficulty: difficulty
    });
   
    // checking if the information inside the object is equel to the declared variables
    it('has a timestamp', () => {
        expect(block.timestamp).toEqual(timestamp);
    });

    it('has a lastHash', () => {
        expect(block.lastHash).toEqual(lastHash);
    });

    it('has a hash', () => {
        expect(block.hash).toEqual(hash);
    });

    it('has a data', () => {
        expect(block.data).toEqual(data);
    });

    it('has a nonce', () => {
        expect(block.nonce).toEqual(nonce);
    });

    it('has a difficulty', () => {
        expect(block.difficulty).toEqual(difficulty);
    })

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();
    

        it('returns a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('returns genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('minedBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'mined block';
        const minedBlock = Block.mineBlock({ lastBlock, data });

        it('returns a Block instance', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('sets the `lastHash` to the `hash` of lastBlock', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets the `data` - data not undefined', () => {
            expect(minedBlock.data).not.toEqual(undefined);
        });

        it('generates a sha256 `hash` based on the inputs', () => {
            expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp, lastBlock.hash, data, minedBlock.nonce, minedBlock.difficulty));
        });

        it('sets a `hash` that matches the difficulty criteria', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        });

        it('adjusts the difficulty', () => {
            const possibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];

            // confirm if the difficult was really modified
            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });
    });

    describe('adjustDifficulty()', () => {
        it('raises the difficulty for a quick mined block', () => {
            expect(Block.adjustDifficulty({ originalBlock: block, timestamp: block.timestamp + MINE_RATE - 100}))
                .toEqual(block.difficulty + 1);
        });

        it('lowers the difficulty for a slow mined block', () => {
            expect(Block.adjustDifficulty({ originalBlock: block, timestamp: block.timestamp + MINE_RATE + 100}))
                .toEqual(block.difficulty - 1);
        });

        it('has a lower limit of 1', () => {
            block.difficulty = -1;

            // not needed to pass timestamp, once it does not affect the result
            expect(Block.adjustDifficulty({ originalBlock: block })).toEqual(1);
        });
    });
});
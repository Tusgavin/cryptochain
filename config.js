// Store global values and hard code
const MINE_RATE = 1000;

const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
    // set default values for GENESIS_BLOCK
    timestamp: 1,
    lastHash: '-----',
    hash: 'gen-one',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data: []
};

// exports a object
module.exports = { GENESIS_DATA, MINE_RATE };
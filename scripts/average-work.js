// script to compare binary hash values and hexadecimal hash values

const Blockchain = require('../blockchain');

const blockchain = new Blockchain;

// creates initial block 
blockchain.addBlock({ data: 'initial-block' });

console.log(blockchain.chain[blockchain.chain.length - 1]);

let prevTimeStamp, nextTimeStamp, nextBlock, timeDifference, average;

const times = [];

for(let i = 0; i < 10000; i++) {
    prevTimeStamp = blockchain.chain[blockchain.chain.length - 1].timestamp;

    // template string so we can insert some values in it, in this example the variable 'i'
    blockchain.addBlock({ data: `block ${i}`});
    nextBlock = blockchain.chain[blockchain.chain.length - 1];

    nextTimeStamp = nextBlock.timestamp;
    timeDifference = nextTimeStamp - prevTimeStamp;
    times.push(timeDifference);

    // .reduces() is a callback function that add each individual element from times array to the total
    average = times.reduce((total, num) => (total + num))/(times.length);

    console.log(`Time to mine block: ${timeDifference}ms. Difficulty: ${nextBlock.difficulty}. Average time: ${average}ms`);
}

// Conclusion: using binary hashes increasy the difficulty
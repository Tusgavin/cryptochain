// require a modeule called crypto
const crypto = require('crypto');

// '...array' is a spread operator so the function can takes multiple arguments
const cryptoHash = (...inputs) => {
    // creating hash object from crypto module using the specific sha256 function
    const hash = crypto.createHash('sha256');

    // create the hash value based on the strings given
    // sort the array so we can get the same output independently of the input's order
    hash.update(inputs.sort().join(' '));

    // represent the result of the hash in binary
    return hash.digest('hex');
};

module.exports = cryptoHash;
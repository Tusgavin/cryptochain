// require ec class from elliptic module - (EC = elliptic cryptography)
const EC = require('elliptic').ec;
const cryptoHash = require('./crypto-hash');

// secp256k1 is a cryptography algorithm used in bitcoin and generates a prime number of 256 bits
const ec = new EC('secp256k1');

const verifySignature = ({ publicKey, data, signature }) => {
    // creating temporaly key object from publicKey coming in 'hex' form, so we can use the verify function from ec
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

    return keyFromPublic.verify(cryptoHash(data), signature);
};

module.exports = { ec, verifySignature, cryptoHash };
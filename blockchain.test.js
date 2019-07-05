const Blockchain = require('./blockchain');
const Block = require('./block');
const cryptoHash = require('./crypto-hash')

describe('Blockchain', () => {
    // variable
    let blockchain, newChain, originalChain;

    // get a fresh instance of Blockchain before each case so it gets a clean object for the next case
    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();

        // identical blockchain object
        originalChain = blockchain.chain;
    });

    it('contains a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('start with the `genesis` block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain', () => {
        const newData = 'foo-data';
        // argument of addBlock() in form of object
        blockchain.addBlock({ data: newData });

        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when does not start with genesis block', () => {
            it('returns False', () => {
                blockchain.chain[0] = ({ data: 'fake-gen' });

                // once isValidValid() is a static member we can call it by its class name
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with genesis block and has multiple blocks', () => {

            // reuse code for the next 3 describers
            beforeEach(() => {
                blockchain.addBlock({ data: 'Bees' });
                blockchain.addBlock({ data: 'Bats' });
                blockchain.addBlock({ data: 'Bears' });
            });

            describe('and the lastHash has changed', () => {
                it('returns False', () => {
                    blockchain.chain[2].lastHash = 'broken-hash';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with invalid field', () => {
                it('return False', () => {
                    blockchain.chain[2].data = 'broken-data';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with jumped difficulty', () => {
                it('returns flase', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length-1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;
                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
                    
                    const badBlock = new Block({ timestamp, lastHash, hash, nonce, difficulty, data });

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain does not contain any invalid blocks', () => {
                it('returns True', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });

    describe('replaceChain()', () => {
        let errorMock, logMock;

        beforeEach(() => {
            // Mock functions capture calls to the function, so it does not print in the console
            // but we can test if it was called during the execution
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
            global.console.log = logMock;
        });

        describe('when the new chain is not longer', () => {
            beforeEach(() => {
                // modify some property so we can get an actual test
                newChain.chain[0] = { data: 'modified-data' };

                blockchain.replaceChain(newChain.chain);
            });

            it('does not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it('logs an error' ,() => {
                expect(errorMock).toHaveBeenCalled();
            });
        });
        
        describe('when the new chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({ data: 'Bees' });
                newChain.addBlock({ data: 'Bats' });
                newChain.addBlock({ data: 'Bears' });
            });

            describe('and the chain is invalid', () => {
                beforeEach(() =>{
                    newChain.chain[2].hash = 'fake-hash';

                    blockchain.replaceChain(newChain.chain);
                });

                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                })
            });

            describe('and the chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });

                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it('logs about chain replacement', () => {
                    expect(logMock).toHaveBeenCalled();
                })
            });
        });
    });
});
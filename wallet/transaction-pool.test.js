const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool', () => {
    let transactionPool, transaction, senderWallet;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = new Transaction({ 
            senderWallet,
            recipient: 'fake-recipient',
            amount: 50
         });
    });

    describe('set transaction()', () => {
        it('adds a transaction', () => {
            transactionPool.setTransaction(transaction);

            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    });

    describe('existingTransaction()', () => {
        it('returns an existing transaction given an input address', () => {
            transactionPool.setTransaction(transaction);

            expect(transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey })).toBe(transaction);
        });
    });

    describe('validTransactions()', () => {
        let validTransactions, errorMock;

        beforeEach(() => {
            validTransactions = [];
            errorMock = jest.fn();
            global.console.error = errorMock;

            for(let aux = 0; aux < 10; aux++) {
                transaction = new Transaction({ 
                    senderWallet,
                    recipient: 'new-recipient',
                    amount: 30
                });

                if(aux % 3 === 0) {
                    // generate invalid by changing amount
                    transaction.input.amount = 999999;
                } else if(aux % 3 === 1) {
                    // generate invalid by changing signature
                    transaction.input.signature = new Wallet().sign('foo');
                } else {
                    validTransactions.push(transaction);
                }

                transactionPool.setTransaction(transaction);
            }
        });

        it('return valid transactions', () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        });

        it('logs errors for the invalid transactions', () => {
            transactionPool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        });
    });

    describe('clear()', () => {
        it('clears the transactions', () => {
            transactionPool.clear();

            expect(transactionPool.transactionMap).toEqual({});
        });
    }); 

    describe('clearBlockchainTransactions()', () => {
        it('clears the pool of any existing blockchain transactions', () => {
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            // generates random transactions and inserts some of them in the blockchain
            for(let aux = 0; aux < 6; aux++) {
                const transaction = new Wallet().createTransaction({ recipient: 'foo', amount: '10' });
                
                transactionPool.setTransaction(transaction);
                
                if(aux % 2 === 0) {
                    blockchain.addBlock({ data: [transaction] });
                } else {
                    expectedTransactionMap[transaction.id] = transaction;
                }
            }

            transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });

            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
        });
    });
});
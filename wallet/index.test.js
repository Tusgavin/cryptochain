const Wallet = require('./index');
const { verifySignature } = require('../utils');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain');
const { STARTING_BALANCE } = require('../config');

describe('Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it('has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey`', () => {
        //console.log(wallet.publicKey);

        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () => {
        const data = 'foobar';

        it('verifies a signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data: data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        });

        it('does not verify an invalid signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data: data,
                    // gen a invalid signature by using a new Wallet obj
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        });
    });

    describe('createTransaction()', () => {
        describe('and the amount excedes the balance', () => {
            it('throws an error', () => {
                expect(() => wallet.createTransaction({ amount: 999999, recipient: 'foo-recipient' })).toThrow('Amount excedes balance');
            });
        });

        describe('and the amount is valid', () => {
            let transaction, amount, recipient;

            beforeEach(() => {
                amount = 50;
                recipient = 'foo-recipient';
                transaction = wallet.createTransaction({ amount, recipient });
            });

            it('creates an instance of `Transaction`', () => {
                expect(transaction instanceof Transaction).toBe(true);
            });

            it('matches the input with the walllet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it('outputs the amount the recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });
        });

        describe('and a chain is passed', () => {
            it('calls `Wallet.calculateBalance`', () => {
                const calculateBalanceMock = jest.fn();

                const originalCalculateBallance = Wallet.calculateBalance;

                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({ recipient: 'foo', amount: 50, chain: new Blockchain().chain });

                Wallet.calculateBalance = originalCalculateBallance;

                expect(calculateBalanceMock).toHaveBeenCalled();
            });
        });
    });

    describe('calculateBalance()', () => {
        let blockchain;

        beforeEach(() => {
            blockchain = new Blockchain();
        });

        describe('and there are no outputs for the wallet', () => {
            it('returns the `STARTING_BALANCE`', () => {
                expect(Wallet.calculateBalance({ chain: blockchain.chain, address: wallet.publicKey })).toEqual(STARTING_BALANCE);
            });
        });

        describe('and there are outputs for the wallet', () => {
            let transactionOne, transactionTwo;

            beforeEach(() => {
                transactionOne = new Wallet().createTransaction({ amount: 50, recipient: wallet.publicKey });
                transactionTwo = new Wallet().createTransaction({ amount: 60, recipient: wallet.publicKey });

                blockchain.addBlock({ data: [transactionOne, transactionTwo] });
            });

            it('adds the sum of all outputs to the wallet balance', () => {
                expect(Wallet.calculateBalance({ chain: blockchain.chain, address: wallet.publicKey }))
                    .toEqual( STARTING_BALANCE + transactionOne.outputMap[wallet.publicKey] + transactionTwo.outputMap[wallet.publicKey]);
            });

            describe('and the wallet has made a transaction', () => {
                let recentTransaction;

                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({ recipient: 'foo-address', amount: 40 });

                    blockchain.addBlock({ data: [recentTransaction] });
                });

                it('returns the output amount of the recent transaction', () => {
                    expect(Wallet.calculateBalance({ chain: blockchain.chain, address: wallet.publicKey }))
                        .toEqual(recentTransaction.outputMap[wallet.publicKey]);
                });

                describe('and there are outputs next to and after the recent transactions', () => {
                    let sameBlockTransaction, nextBlockTransaction;

                    beforeEach(() => {
                        // A miner - local wallet - creates a transaction and recieve a reward in the same block
                        recentTransaction = wallet.createTransaction({ recipient: 'later-foo-address', amount: 60 });
                        sameBlockTransaction = Transaction.rewardTransaction({ minerWallet: wallet });

                        blockchain.addBlock({ data: [recentTransaction, sameBlockTransaction] });

                        // The local wallet is recieving in the next block
                        nextBlockTransaction = new Wallet().createTransaction({ recipient: wallet.publicKey, amount:75 });

                        blockchain.addBlock({ data: [nextBlockTransaction] });
                    });

                    it('includes the outputs amount in the returned balance', () => {
                        expect(Wallet.calculateBalance({ chain: blockchain.chain, address: wallet.publicKey }))
                            .toEqual(recentTransaction.outputMap[wallet.publicKey] + sameBlockTransaction.outputMap[wallet.publicKey] + nextBlockTransaction.outputMap[wallet.publicKey]);
                    });
                });
            });
        });
    });
});
// In software architecture, publish–subscribe is a messaging pattern where senders of messages, called publishers, do not program the messages to be sent 
// directly to specific receivers, called subscribers, but instead categorize published messages into classes without knowledge of which subscribers, if any, there may be. 
// Similarly, subscribers express interest in one or more classes and only receive messages that are of interest, without knowledge of which publishers, if any, there are.
// References: Wikipedia

const PubNub = require('pubnub');

const credentials = {
    publishKey: 'pub-c-e8ad70e9-e4a3-4f23-aa55-b0ae59f11f48',
    subscribeKey: 'sub-c-9864439c-9930-11e9-8e9d-1623aee89087',
    secretkey: 'sec-c-ZDcyYmE0NjMtYjNhNS00NmI5LWIwYWEtM2Q0MjAzYjdjODY0'
};

// defining channels
const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
};

// creating PubSub class so it can Publish and Subscribe in PubNub app services
class PubSub {
    constructor({ blockchain, transactionPool, wallet }) {
        // put the PubSub class to work with a blockchain instance
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubnub = new PubNub(credentials);

        // subscribe PubNub instance to the channels
        this.pubnub.subscribe({ channels: [Object.values(CHANNELS)] })

        this.pubnub.addListener(this.listener());
    }

    listener() {
        return {
            // handling message event published and extracting the channel and the actual message
            message: (messageObject) => {
                const { channel, message } = messageObject;
                
                console.log(`Message received. Channel: ${channel}. Message: ${message}`);

                // transform the JSON.stringyfied chain back to a JavaScript object array
                const parsedMessage = JSON.parse(message);

                switch(channel) {
                    case CHANNELS.BLOCKCHAIN:
                      this.blockchain.replaceChain(parsedMessage, true, () => {
                        this.transactionPool.clearBlockchainTransactions({ chain: parsedMessage.chain });
                      });
                      break;
                    // Pubnub is not able to prevent self-broadcasts, so it does not take callback functions to fire when the pub/sub functions complete
                    case CHANNELS.TRANSACTION:
                      if (!this.transactionPool.existingTransaction({ inputAddress: this.wallet.publicKey })) {
                        this.transactionPool.setTransaction(parsedMessage);
                      }
                      break;
                    default:
                      return;
                } 
            }
        };
    }

    publish({ channel, message }) {
        this.pubnub.publish({ channel, message });
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            // once it can only publish strings, we must use JSON.stringfy method and pass the chain array as parameters so we can publish it
            message: JSON.stringify(this.blockchain.chain)
        });
    }

    broadcastTransaction(transaction) {
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        });
    }
}

 //const teste = new PubSub();

 //teste.publish({ channel: CHANNELS.TEST, message: 'oi'});
 //teste.listener();

module.exports = PubSub;
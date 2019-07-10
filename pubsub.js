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
    BLOCKCHAIN: 'BLOCKCHAIN'
};

// creating PubSub class so it can Publish and Subscribe in PubNub app services
class PubSub {
    constructor({ blockchain }) {
        // put the PubSub class to work with a blockchain instance
        this.blockchain = blockchain;
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

                if(channel === CHANNELS.BLOCKCHAIN) {
                    this.blockchain.replaceChain(parsedMessage);
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
}

 //const teste = new PubSub();

 //teste.publish({ channel: CHANNELS.TEST, message: 'oi'});
 //teste.listener();

module.exports = PubSub;
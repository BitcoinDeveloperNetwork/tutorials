# Accessing Bitcoin's ZeroMQ interface

## Introduction

In this tutorial, we will be taking a closer look at bitcoin's ZeroMQ messaging interface. This interface is useful for developing applications which might require data related to `block` and `transaction` events from a Bitcoin core node. Some applications which include block explorers, wallets and reporting dash boards to name just a few.

## Background


[ZeroMQ](http://zeromq.org/) is a high-performance asynchronous messaging library, aimed at use in distributed or concurrent applications. It provides a message queue, but unlike message-oriented middleware, a ZeroMQ system can run without a dedicated message broker.

The Bitcoin Core daemon can be configured to act as a trusted "border router", implementing the [bitcoin wire protocol](/bitcoin wire protocol/) and relay, making consensus decisions, maintaining the local blockchain database, broadcasting locally generated transactions into the network, and providing a queryable RPC interface to interact on a polled basis for requesting blockchain related data. However, there exists only a limited service to notify external software of events like the arrival of new blocks or transactions.

The ZeroMQ facility implements a notification interface through a set of specific notifiers. Currently there are notifiers that publish blocks and transactions. This read-only facility requires only the connection of a corresponding ZeroMQ subscriber port in receiving software; it is not authenticated nor is there any two-way protocol involvement. Therefore, subscribers should validate the received data since it may be out of date, incomplete or even invalid.

ZeroMQ sockets are self-connecting and self-healing; that is, connections made between two endpoints will be automatically restored after an outage, and either end may be freely started or stopped in any order.

Because ZeroMQ is message oriented, subscribers receive transactions and blocks all-at-once and do not need to implement any sort of buffering or reassembly.


## What you'll need

You will need access to a bitcoin node. We suggest executed against a node configured in `regtest` mode so that we can have the freedom of playing with various scenarios without having to loose real money. You can however execute these against either the `testnet` or `mainnet` configurations.

> **Note:**
> If you don't currently have access to a bitcoin development environment set up, dont' worry, we have your back! We've setup a web based mechanism which provisions your very own private session that includes these tools and comes preconfigured with a bitcoin node in `regtest` mode. https://bitcoindev.network/bitcoin-cli-sandbox/
> Alternatively, we have also provided a simple docker container configured in `regtest` mode that you can install for testing purposes.
> ```console
> gr0kchain:~ $ docker volume create --name=bitcoind-data
> gr0kchain:~ $ docker run -v bitcoind-data:/bitcoin --name=bitcoind-node -d \
>      -p 18444:18444 \
>      -p 127.0.0.1:18332:18332 \
>      bitcoindevelopernetwork/bitcoind-regtest
> ```

By default, the ZeroMQ feature is automatically compiled in if the necessary prerequisites are found.  To disable, use --disable-zmq during the *configure* step of building bitcoind:

```console
gr0kchain bitcoindev $ ./configure --disable-zmq ....
```

## Let's get started

Before we dive into things, let's have a brief taste of what we can expect to learn from this tutorial.

<script id="asciicast-OupN3kPJIxTcNLgtNORDVKIAC" src="https://asciinema.org/a/OupN3kPJIxTcNLgtNORDVKIAC.js" async data-size="small" data-autoplay="true" data-loop=”true”></script>

In the use case demonstrated above, we have executed a script which listens for one of four configurable events from our Bitcoin Core node. The script prints out the transaction identifiers as they are received by our node.

Bitcoin's ZMQ uses a publish/subscribe ([pubsub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)) design pattern, where the publisher in our case is our bitcoin node which published messages based on events. The subscriber on the other hand, includes any application looking to utilise it by subscribing to these events. There are currently 4 different publish (PUB) notification topics we can expose via `bitcoind` which notify us when ever a new block or transaction is validated by the node.

* zmqpubhashtx : Publishes transaction hashes
* zmqpubhashblock : Publishes block hashes
* zmqpubrawblock : Publishes raw block information
* zmqpubrawtx : Publishes raw transaction information


### Enabling zmq

To enable these features, you will need to update your `bitcoin.conf` file. We will start by reviewing the `--help` flag from our `bitcoind` command.

```console
bitcoind --help | grep zmq -A3
  -zmqpubhashblock=<address>
       Enable publish hash block in <address>

  -zmqpubhashtx=<address>
       Enable publish hash transaction in <address>

  -zmqpubrawblock=<address>
       Enable publish raw block in <address>

  -zmqpubrawtx=<address>
       Enable publish raw transaction in <address>

Debugging/Testing options:
--
       mempool, http, bench, zmq, db, rpc, estimatefee, addrman,
       selectcoins, reindex, cmpctblock, rand, prune, proxy, mempoolrej,
       libevent, coindb, qt, leveldb.

```

Here we can see the four message types together with information on how to enable debugging for various components including `zmq`.

> **Note:**
> When developing, it is useful to always keep `debug` configured to `1` in your `bitcoin.conf` file.

Each of our PUB topics can be configured using an tcp socket on the configured address. This address is where Bitcoin Core will be publishing messages to the various topics a subscribed might be interested in.

We can call the `getzmqnotifications` remote procedure call (RPC) method to see if any of the `zmq` services are currently running.

```console
gr0kchain@bitcoindev $ bitcoin-cli  getzmqnotifications
[
]
```

If you receive an empty array as shown above, you will need to update your `bitcoin.conf` by adding the following:

```console
zmqpubrawblock=tcp://127.0.0.1:29000
zmqpubrawtx=tcp://127.0.0.1:29000
zmqpubhashtx=tcp://127.0.0.1:29000
zmqpubhashblock=tcp://127.0.0.1:29000
```

Next up, we will need to restart `bitcoind` for the changes to take effect.

```console
gr0kchain@bitcoindev $ bitcoin-cli stop
Bitcoin server stopping
gr0kchain@bitcoindev $ bitcoind
Bitcoin server starting
gr0kchain@bitcoindev $ bitcoin-cli  getzmqnotifications
[
  {
    "type": "pubhashblock",
    "address": "tcp://127.0.0.1:29000"
  },
  {
    "type": "pubhashtx",
    "address": "tcp://127.0.0.1:29000"
  },
  {
    "type": "pubrawblock",
    "address": "tcp://127.0.0.1:29000"
  },
  {
    "type": "pubrawtx",
    "address": "tcp://127.0.0.1:29000"
  }
]
```

We are now ready to start playing around with these services.

### Writing our client

There are many ways in which you can write clients that can connect to `zmq` servers. For simplicity, we will be using javascript, but feel free to search for libraries related to your language of choice.

Let's start by creating a directory for our project.

```console
gr0kchain@bitcoindev $ mkdir ./bitcoin-zmq/ && cd ./bitcoin-zmq/
```

We will be using the [zmq](https://www.npmjs.com/package/zmq) node package which you can install as follows.

```console
gr0kchain@bitcoindev $ npm install zmq
```

Create a file called `index.js` and include the `zmq` package as follows.

```console
var zmq = require('zmq')
  , sock = zmq.socket('sub')
```

Next, add a line for connecting to the `zmq` address we had previously configured in our `bitcoind.conf` file.

```console
sock.connect('tcp://127.0.0.1:29000');
```

Now add an event handled for the event `message`. This event will be triggered every time we receive any event from the `zmq` service.

```console
sock.on('message', function(topic, message) {
  console.log(topic, message)
})
```

Connecting to the interface does not yield much unless we subscribe to one of the 4 topics we had mentioned earlier. You can do this by calling the `subscribe` method to our `sock` instance.

```console
sock.subscribe('hashtx')
```

Here we are notifying the Bitcoin Core ZMQ server that we are interested in getting updates on transactions identifiers whenever it learns of new ones. Now let's test our new script.

```console
gr0kchain@bitcoindev $ node ./index.js

```

Running this should result in what appears to be a terminal in a waiting state. Our script is waiting to be notified of incoming transactions. Since we're using a node configured in `regtest` mode, we need to manually generate some blocks in a separate terminal session.

```console
gr0kchain@bitcoindev $ bitcoin-cli generate 1
[
  "7a5865e307d49d4be5ff5a902cadca33a88b34b5acc2603c1b7eb2fae904d09e"
]
```

After generating a block, you should have output being printed from the terminal where our script is running.

```console
gr0kchain@bitcoindev $ node ./test.js
<Buffer 68 61 73 68 74 78> <Buffer c9 78 0b ec fe 8d 28 1f df 60 f3 11 d1 80 06 e0 f7 ef 82 6a 30 c6 b1 8a 3d 34 58 5c 17 44 b5 54>
```

Assuming all went well, you should have received output which indicates that you have successfully subscribed and received your first notification, good job!

The information returned however seems to be loaded into a `Buffer` for both our `topic` and `message`. Each of the pub topics will return a binary representation of the data we have subscribed to whenever the node fires an event. We can decode this by updating our `message` handler as follows.

```console
sock.on('message', function(topic, message) {
  console.log(topic.toString(), message.toString('hex'))
})
```

Try executing your script again after making this change.

```console
gr0kchain@bitcoindev $ (sleep 1; bitcoin-cli generate 1 &) | node ./index.js
hashtx cfe75bb40d10f32da2a274212a468f6535a58126737cd9df2bba43516467524f
```

> **Note**
> For simplicity, we prefix calling our script here with a command that will generate a block after one second.

Here we can now see the `topic` and the `transaction identifier` being printed to screen.

Next, let's update our subscription from `hashtx` to `rawtx`.

```console
sock.subscribe('rawtx')
```

```console
gr0kchain@bitcoindev $ (sleep 1; bitcoin-cli generate 1 &) | node ./test.js
rawtx 020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff0502a40f0101ffffffff024a000000000000002321033f0988379277fac6be4113e1d59e0657477e5167968ac866f9297c754df73568ac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf90120000000000000000000000000000000000000000000000000000000000000000000000000
```

> **Note**
> We will cover transactions in more detail in future tutorials, for more information on these, checkout [Raw Transaction Format](https://bitcoin.org/en/developer-reference#raw-transaction-format). Some useful libraries to decode these on the client include [bitcoin-js](https://github.com/bitcoinjs/bitcoinjs-lib) or [bcoin](http://bcoin.io). There are many more, so search for libraries which suit your needs.

The Bitcoin Core RPC interface exposes a useful method called `decoderawtransacton` which we can used for decoding our raw transaction hex string by passing it as the first parameter.

```console
gr0kchain@bitcoindev $ bitcoin-cli help | grep getrawtransaction
getrawtransaction "txid" ( verbose "blockhash" )
gr0kchain@bitcoindev $ bitcoin-cli decoderawtransaction 020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff0502a40f0101ffffffff024a000000000000002321033f0988379277fac6be4113e1d59e0657477e5167968ac866f9297c754df73568ac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf90120000000000000000000000000000000000000000000000000000000000000000000000000
{
  "txid": "6e3eb1fef01a7687f1307d89209622c4c065564321cefa10e2dc67cdc60dd7c3",
  "hash": "dcd5a68e4ed4319574bd15c8f3916a6ad3261a82c354702ed2fa479899d7e25f",
  "version": 2,
  "size": 183,
  "vsize": 156,
  "weight": 624,
  "locktime": 0,
  "vin": [
    {
      "coinbase": "02a40f0101",
      "sequence": 4294967295
    }
  ],
  "vout": [
    {
      "value": 0.00000074,
      "n": 0,
      "scriptPubKey": {
        "asm": "033f0988379277fac6be4113e1d59e0657477e5167968ac866f9297c754df73568 OP_CHECKSIG",
        "hex": "21033f0988379277fac6be4113e1d59e0657477e5167968ac866f9297c754df73568ac",
        "reqSigs": 1,
        "type": "pubkey",
        "addresses": [
          "mg3jhVQngZuucbJTBq5w188XqDer7a6AL4"
        ]
      }
    },
    {
      "value": 0.00000000,
      "n": 1,
      "scriptPubKey": {
        "asm": "OP_RETURN aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9",
        "hex": "6a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9",
        "type": "nulldata"
      }
    }
  ]
}
```

> **Note**
> We could also get the same raw data by using the `getrawtransaction` RPC call.
> ```console
> gr0kchain@bitcoindev $ bitcoin-cli getrawtransaction 6e3eb1fef01a7687f1307d89209622c4c065564321cefa10e2dc67cdc60dd7c3
> 020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff0502a40f0101ffffffff024a000000000000002321033f0988379277fac6be4113e1d59e0657477e5167968ac866f9297c754df73568ac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf90120000000000000000000000000000000000000000000000000000000000000000000000000
> ```

### Adding some RPC code

Getting there, but we should really try and add this functionality into our script. For that, we will be adding a simple node package called [bitcoin-rpc](https://www.npmjs.com/package/bitcoind-rpc).

```console
gr0kchain@bitcoindev $ npm install bitcoin-rpc
```

Next, we update our file to include the `bitcoin-rpc` package as follows.

```console
var zmq = require('zmq')
  , sock = zmq.socket('sub')
  , RpcClient = require('bitcoind-rpc');
```

We will need to provide a configuration object for connecting to our node as well.

```console
var config = {
    protocol: 'http',
    user: 'bitcoin',
    pass: 'local321',
    host: '127.0.0.1',
    port: '18443',
};

var rpc = new RpcClient(config);
```

> **Note**
> The `user`  `pass` are configured in your `bitcoind.conf` file
> ```console
> rpcuser=bitcoin
> rpcpassword=local321
> ```
> `host` is the ip address for our Bitcoin core RPC server, and the `port` it has been configured to listen on.

We can now update our `message` listener as follows.

```console
sock.on('message', function(topic, message) {
  rpc.decodeRawTransaction(message.toString('hex'), function(err, resp) {
        console.log(JSON.stringify(resp, null, 4))
  })
})
```

Here we are calling the `decodeRawTransaction` method and passing it the `hex` encoded string of our `rawtx` message we received from the `zmq` interface. We then proceed by printing out the message by encoding it using `JSON.stringify` with some additional parameters for making it legible on screen.

```console
gr0kchain@bitcoindev $ (sleep 1; bitcoin-cli generate 1 &) | node ./index.js
{
    "result": {
        "txid": "79ee96f488a3d3b307df45ac89eec17ea335f8e22698af2158451cb4e487eef4",
        "hash": "eb4b5e1480b12d4c8e96e4b2d5f2637ce5668adc5e4a9a080e01a55eeb537390",
        "version": 2,
        "size": 183,
        "vsize": 156,
        "weight": 624,
        "locktime": 0,
        "vin": [
            {
                "coinbase": "02a70f0101",
                "sequence": 4294967295
            }
        ],
        "vout": [
            {
                "value": 7.4e-7,
                "n": 0,
                "scriptPubKey": {
                    "asm": "02fb46793d2cad9d2a82aa8c78bccafb567364e27972bf457e4d2e66972b3e8011 OP_CHECKSIG",
                    "hex": "2102fb46793d2cad9d2a82aa8c78bccafb567364e27972bf457e4d2e66972b3e8011ac",
                    "reqSigs": 1,
                    "type": "pubkey",
                    "addresses": [
                        "mzEFBeGJCqHYg6ycSMh9RFuJ3jGK2RFDPj"
                    ]
                }
            },
            {
                "value": 0,
                "n": 1,
                "scriptPubKey": {
                    "asm": "OP_RETURN aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9",
                    "hex": "6a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9",
                    "type": "nulldata"
                }
            }
        ]
    },
    "error": null,
    "id": 63888
}
```

We are now decoding our `rawtx` data using the `decoderawtransacton` RPC method from our Bitcoin Core node!

The final version of our script should look something like this.

```console
var zmq = require('zmq')
  , sock = zmq.socket('sub')
  , RpcClient = require('bitcoind-rpc');

var config = {
    protocol: 'http',
    user: 'bitcoin',
    pass: 'local321',
    host: '127.0.0.1',
    port: '18443',
};

var rpc = new RpcClient(config);

console.log("T")
sock.connect('tcp://127.0.0.1:29000');

sock.subscribe('rawtx')

sock.on('message', function(topic, message) {
  rpc.decodeRawTransaction(message.toString('hex'), function(err, resp) {
        console.log(JSON.stringify(resp, null, 4))
  })
})
```

## Exposing ZMQ over WebSockets

For the more adventurous, you might want to look into exposing these messages over `WebSockets`. This might be useful for web-based applications looking to report on these events.

```console
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8090 })
const bitcoinjs = require("bitcoinjs-lib")
var zmq = require('zmq')
  , sock = zmq.socket('sub')

sock.connect('tcp://127.0.0.1:29000')
sock.subscribe('rawtx')

sock.on('message', function(topic, message) {
  wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate()
        var tx = bitcoinjs.Transaction.fromHex(message)
        ws.emit("message", tx)
  })
})

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(tx) {
    ws.send(JSON.stringify(tx))
  });

})
```

You can listen to any incoming message from the cli using `wscat`.

```console
gr0kchain@bitcoindev $ npm install -g wscat
gr0kchain@bitcoindev $ wscat -c ws://localhost:8090
connected (press CTRL+C to quit)
< {"version":2,"locktime":0,"ins":[{"hash":{"type":"Buffer","data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"index":4294967295,"script":{"type":"Buffer","data":[2,188,15,1,1]},"sequence":4294967295,"witness":[{"type":"Buffer","data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}]}],"outs":[{"value":74,"script":{"type":"Buffer","data":[33,2,67,153,212,236,202,84,29,90,228,49,114,92,212,248,252,134,49,86,146,53,254,96,235,47,137,243,84,132,137,52,151,72,172]}},{"value":0,"script":{"type":"Buffer","data":[106,36,170,33,169,237,226,246,28,63,113,209,222,253,63,169,153,223,163,105,83,117,92,105,6,137,121,153,98,180,139,235,216,54,151,78,140,249]}}]}
```

You might also be interested in doing this from your web browser.

```console
 var ws = new WebSocket("ws://localhost:8090")
 ws.onmessage = console.log
```

Happy hacking fellow bitcoiner!

## Conclusion

In this tutorial, we had a closer look at the `zmq` interface exposed by a Bitcoin Core node. We configured our node to expose 4 kinds of messages including, `hashblock`, `hashtx`, `rawblock` and `rawtx`. We subscribed to these and processed the raw data on receipt of new `blocks` and `transactions`.

## Reference

Some other resources which might be of interest.

[Block and Transaction Broadcasting with ZeroMQ](https://github.com/bitcoin/bitcoin/blob/master/doc/zmq.md)
[ZeroMQ](http://zeromq.org/)
[Stackexchange ZeroMQ topic](https://bitcoin.stackexchange.com/questions/tagged/zeromq)
[Bitcoin Explorer](https://github.com/libbitcoin/libbitcoin-explorer)

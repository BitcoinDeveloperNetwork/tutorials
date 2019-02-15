# Bitcoin mempool statistics

## Introduction

In this tutorial we will be learning more about the bitcoin memory pool (mempool), what it is used for, how it works and ways in which you might consider using it for reporting or other useful functions and or applications.

## Background

The bitcoin `mempool` is a mechanism used to store a backlog of pending transactions which are potentially valid candidates for inclusion by miners into a block. You can think of this in a similar way as managing a list of tasks using a simple input-output-tray scenario. Input will be out list of todo's or transactions, and the output would be once they have been included into a block.

Each node manages its own state of reality with regards to the `mempool`. This state depends on various factors including the preferences configured by the node for allowing a transaction, the time at which the transaction was received as well as various other checks. It is very rare that you might find two nodes with the exact same `mempool` state of transactions when compared to any other node. Only once a transaction has passed these rules, and assuming the configuration permitting, a transaction would typically be distributed to other nodes over the network which validate and complete this process through transaction propagation.

## Before we get started

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

## Let's get started

We had mentioned before that the `mempool` is typically used by a bitcoin node to manage state of pending candidate transactions to be included into blocks.

For this tutorial, we will be using Bitcore Core version 0.17.1.

```console
gr0kchain $ bitcoin-cli --version
Bitcoin Core RPC client version v0.17.1
```
> **Note**
> The bitcoin-cli interface is a convenient way of speaking to a bitcoin node's remote procedure call interface. This RPC interface is usually exposed over an HTTP server which is bound to the local loopback device, or localhost of the server on which `bitcoind` is running. To enable this ensure that you have set the `server` parameter to `1` in your  `bitcoin.conf` file.

Let's start off by seeing how we can have a peek into the `mempool` ourselves using the `bitcoin-cli` command line interface bundled with our Bitcoin Core client installation.

```console
gr0kchain $ bitcoin-cli help | grep mempool
getmempoolancestors txid (verbose)
getmempooldescendants txid (verbose)
getmempoolentry txid
getmempoolinfo
getrawmempool ( verbose )
gettxout "txid" n ( include_mempool )
savemempool
testmempoolaccept ["rawtxs"] ( allowhighfees )
```

Here we have invoked the `help` parameter for `bitcoin-cli` and grepped it for any reference to `mempool`. You can obtain more information on how to use any of these commands by issuing `bitcoin-cli help <cmd>`.

```console
gr0kchain $ bitcoin-cli help getmempoolinfo
getmempoolinfo

Returns details on the active state of the TX memory pool.

Result:
{
  "size": xxxxx,               (numeric) Current tx count
  "bytes": xxxxx,              (numeric) Sum of all virtual transaction sizes as defined in BIP 141. Differs from actual serialized size because witness data is discounted
  "usage": xxxxx,              (numeric) Total memory usage for the mempool
  "maxmempool": xxxxx,         (numeric) Maximum memory usage for the mempool
  "mempoolminfee": xxxxx       (numeric) Minimum fee rate in BTC/kB for tx to be accepted. Is the maximum of minrelaytxfee and minimum mempool fee
  "minrelaytxfee": xxxxx       (numeric) Current minimum relay fee for transactions
}

Examples:
> bitcoin-cli getmempoolinfo
> curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getmempoolinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

Based on the help command for `getmempoolinfo`, let's have a look at the active state of our own nodes `mempool`.

```console
gr0ckchian $ bitcoin-cli getmempoolinfo
{
  "size": 0,
  "bytes": 0,
  "usage": 0,
  "maxmempool": 300000000,
  "mempoolminfee": 0.00001000,
  "minrelaytxfee": 0.00001000
}
```

Here we can see some statistics related to the state of our local `mempool` which reports to have a `size` of `0`, meaning that it is empty. Not all that exciting to be honest, so let's add a transaction and see how this works.

Firstly, we'll need to make sure we have enough funds for spending.

```console
gr0ckchian $ bitcoin-cli getbalance
50.00000000
```

> **Note**
> The `bitcoin-cli` interface uses a local wallet assuming this has not been disabled by explicitly setting the `disablewallet` configuration parameter to `1` in our `bitcoin.conf` file.
> You might also need to generate some blocks if you don't have enough funds. Doing this in `regtest` mode is one of the advantages by simply issuing the following command.
> ```console
> bitcoin-cli generate nblocks
> ```
> `nblocks` is the number of blocks we'd like to mine. By default, mining rewards are only spendable after 100 confirmations, so if you have setup a new node, you will need to generate at least 101 blocks before the `getbalance` command will reflect a spendable balance.

Next, we will need an address to which we can spend some bitcoin. For the sake of this tutorial, we'll generate an address from our own wallet for crediting.

```console
gr0ckchian $ bitcoin-cli getnewaddress
2NEYT6A3i9hmTH1pS815ovAnKTWuzaQKD6D
```

We will then proceed to send the amount of 1 bitcoin to this address.

```console
gr0ckchian $ bitcoin-cli sendtoaddress 2NEYT6A3i9hmTH1pS815ovAnKTWuzaQKD6D 1
d1cb61fe6b4cf53143fb70a3417a4f7560fbc38d5e1b5f3728baeaf584d98baa
```

Now let's have a look at our `mempool` again.

```console
gr0ckchian $ bitcoin-cli getmempoolinfo
{
  "size": 1,
  "bytes": 187,
  "usage": 1008,
  "maxmempool": 300000000,
  "mempoolminfee": 0.00001000,
  "minrelaytxfee": 0.00001000
}
```

Based on the result, we can now see that `getmempoolinfo` is reporting that we have a `size` of `1` transaction.

Before we continue though, let's try getting information on our spendable bitcoin by using the `getbalance` rpc call.

```console
gr0ckchian $ bitcoin-cli getbalance
48.99996260
```
Since we sent ourselves one coin, you might expect that we'd be left with 50 bitcoin, however this is the amount reported after deducting our mining fee which we'll cover later. A more interesting point to observe though is the following.

```console
gr0ckchian $ bitcoin-cli getbalance "*" 1
0.00000000
```

So what's happening here? Well, the `getbalance` rpc call implicitly returns a balance based on `0` confirmations. What we have requested here is to shown our balance assuming we have at least `1` confirmation for existing unspent transaction outputs (UTXO's)!

We can also verify this by invoking the `listunspent` rpc call.

```console
gr0ckchian $ bitcoin-cli listunspent
[
]
```

This is evident knowing that we have a pending transaction in the `mempool` which is waiting to get mined. Also worth nothing that we have no spendable utxo's as our previous single utxo of 50 bitcoin was used to create a uxto for 1 and another as change back to ourselves for the remained. Let's have a closer look at the state of our `mempool` again.

```console
gr0ckchian $ bitcoin-cli getrawmempool
[
  "d1cb61fe6b4cf53143fb70a3417a4f7560fbc38d5e1b5f3728baeaf584d98baa"
]```

To the observant, you might have noticed that this command returned the same hexadecimal value as that after executing our `sendtoaddress` command earlier. This is our transaction identified (TXID). You're welcome to try and add more transactions using the `sendtoaddress` command. Notice how these start piling up as we add more to the `mempool`.

```console
gr0ckchian $ bitcoin-cli sendtoaddress 2NEYT6A3i9hmTH1pS815ovAnKTWuzaQKD6D 1
e96b3ecb62729290259ed687efd3f9465a0c569115b0fdf49e6d596e9c4a2980
gr0ckchian $ bitcoin-cli sendtoaddress 2NEYT6A3i9hmTH1pS815ovAnKTWuzaQKD6D 1
b6d7ea3c0c2d4951a05c7b82cf98470427fa7a8d38f9fd7854ba10a9204c9125
gr0ckchian $ bitcoin-cli getrawmempool
[
  "d1cb61fe6b4cf53143fb70a3417a4f7560fbc38d5e1b5f3728baeaf584d98baa",
  "e96b3ecb62729290259ed687efd3f9465a0c569115b0fdf49e6d596e9c4a2980",
  "b6d7ea3c0c2d4951a05c7b82cf98470427fa7a8d38f9fd7854ba10a9204c9125"
]
```

> **Note**
> Reusing the same bitcoin address is discouraged for security purposes and only demonstrated here for the sake of simplicity. For more on why this is not a good idea, checkout [Address reuse
](https://en.bitcoin.it/wiki/Address_reuse) on the bitcoin wiki.

Cool! So we're filling that up nicely, but what if we'd like to get a more details view of this? This can be achieved by simply passing `true` as the first argument to the `getrawmempool` rpc call.

```console
gr0ckchian $ bitcoin-cli getrawmempool true
{
  "d1cb61fe6b4cf53143fb70a3417a4f7560fbc38d5e1b5f3728baeaf584d98baa": {
    "fees": {
      "base": 0.00003740,
      "modified": 0.00003740,
      "ancestor": 0.00003740,
      "descendant": 0.00010380
    },
    "size": 187,
    "fee": 0.00003740,
    "modifiedfee": 0.00003740,
    "time": 1550230891,
    "height": 101,
    "descendantcount": 3,
    "descendantsize": 519,
    "descendantfees": 10380,
    "ancestorcount": 1,
    "ancestorsize": 187,
    "ancestorfees": 3740,
    "wtxid": "d1cb61fe6b4cf53143fb70a3417a4f7560fbc38d5e1b5f3728baeaf584d98baa",
    "depends": [
    ],
    "spentby": [
      "e96b3ecb62729290259ed687efd3f9465a0c569115b0fdf49e6d596e9c4a2980"
    ]
  }...
```

Here we can see a more in-depth view related to the details of our pending transaction. You will also notice that when we subtract the `fee` of `0.00003740` from our original `50.00` balance (`49,9999626`), we end up with the result we'd previously seen when calling the `getbalance` rpc call. For more information relating to these pending transaction properties checkout `bitcoin-cli help getrawmempool`.

```console
gr0ckchian $ bitcoin-cli help getrawmempool
getrawmempool ( verbose )

Returns all transaction ids in memory pool as a json array of string transaction ids.

Hint: use getmempoolentry to fetch a specific transaction from the mempool.

Arguments:
1. verbose (boolean, optional, default=false) True for a json object, false for array of transaction ids

Result: (for verbose = false):
[                     (json array of string)
  "transactionid"     (string) The transaction id
  ,...
]

Result: (for verbose = true):
{                           (json object)
  "transactionid" : {       (json object)
    "size" : n,             (numeric) virtual transaction size as defined in BIP 141. This is different from actual serialized size for witness transactions as witness data is discounted.
    "fee" : n,              (numeric) transaction fee in BTC (DEPRECATED)
    "modifiedfee" : n,      (numeric) transaction fee with fee deltas used for mining priority (DEPRECATED)
    "time" : n,             (numeric) local time transaction entered pool in seconds since 1 Jan 1970 GMT
    "height" : n,           (numeric) block height when transaction entered pool
    "descendantcount" : n,  (numeric) number of in-mempool descendant transactions (including this one)
    "descendantsize" : n,   (numeric) virtual transaction size of in-mempool descendants (including this one)
    "descendantfees" : n,   (numeric) modified fees (see above) of in-mempool descendants (including this one) (DEPRECATED)
    "ancestorcount" : n,    (numeric) number of in-mempool ancestor transactions (including this one)
    "ancestorsize" : n,     (numeric) virtual transaction size of in-mempool ancestors (including this one)
    "ancestorfees" : n,     (numeric) modified fees (see above) of in-mempool ancestors (including this one) (DEPRECATED)
    "wtxid" : hash,         (string) hash of serialized transaction, including witness data
    "fees" : {
        "base" : n,         (numeric) transaction fee in BTC
        "modified" : n,     (numeric) transaction fee with fee deltas used for mining priority in BTC
        "ancestor" : n,     (numeric) modified fees (see above) of in-mempool ancestors (including this one) in BTC
        "descendant" : n,   (numeric) modified fees (see above) of in-mempool descendants (including this one) in BTC
    }
    "depends" : [           (array) unconfirmed transactions used as inputs for this transaction
        "transactionid",    (string) parent transaction id
       ... ]
    "spentby" : [           (array) unconfirmed transactions spending outputs from this transaction
        "transactionid",    (string) child transaction id
       ... ]
  }, ...
}

Examples:
> bitcoin-cli getrawmempool true
> curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getrawmempool", "params": [true] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/
```

We can simulate processing these transaction by mining a single block and rechecking the `mempool`.

```console
gr0ckchian $ bitcoin-cli generate 1
[
  "37c053d792b5a2b03a0f6772c8a9107b5d22628e1698c93c18ef5b47663a3c36"
]
gr0ckchian $ bitcoin-cli getmempoolinfo
{
  "size": 0,
  "bytes": 0,
  "usage": 64,
  "maxmempool": 300000000,
  "mempoolminfee": 0.00001000,
  "minrelaytxfee": 0.00001000
}
gr0ckchian $ bitcoin-cli getrawmempool
[
]
```

Great work! You might wish to reconcile this with your `listunspent` call from earlier, but this should give the the basic hand of things.

## Flooding the mempool

Sometimes it might be useful to simulate times when the bitcoin network is dealing with a backlog of transactions. These are usually prioritized by miners for inclusion into blocks. You could go about filling up the `mempool` by doing the following.

```console
gr0ckchian $ for i in {1..10}; do bitcoin-cli sendtoaddress myXbfEKM932h5hqt5LEkoURWvhMnYpt8jW 0.0001; done
d6d2b879d33ba9d1c5f322581bc7aab051b0c7b6dcf1d327db56ad7f9b29ff71
0a4cb1014b726be0d0e5b3f64613062722e07c726e87c5eb3d83ba83ce7eb263
84044ceb4d214330b74839fc91b1bc6da31ff8cc266344c1081a4b999ca9a7bf
1fcb540b2164d7ac4c92a18852e8dfa035ee60e7cfc0079f9697a3cd6fb96ef4
```
Seems to happily chug along, sometimes with errors occurring whenever the internal coin selection process tries to spend utxo's which have not yet been confirmed. This process is also veeeery slow as we can see in this benchmark. Ensure you [Subscribe](#subscribe) to stay updated for future tutorials were we will cover an optimisation for this technique.

```console
gr0ckchian $ start_time=`date +%s`; for i in {1..10}; do bitcoin-cli sendtoaddress myXbfEKM932h5hqt5LEkoURWvhMnYpt8jW 0.0001; done && echo run time is $(expr `date +%s` - $start_time) s
8f8cfc9500c9ddcb6ad10ba9d9724c38b2ffbfff72dc667be2c803506753e3cf
e4448d2ade62ca83e69715b6dc459ba06cff8b08acaac005d352c84c08d4bd4f
702a7f008f70331602740c3ae5eab031beef50035c332d4e9ec37cd69778349a
2e1b8e4b2b3091de6f56b48db241346d4e5496e6e18f1f2db0dedfef0e072a66
d0314be0e1dfefb1bef3b7f47dd420e6c0f08f8c037a4f7c66484489b4ad9b5a
3fc7098275815919e3ede4b44407246526a2110c818d74f08f22cbb730b033af
093354c574aab181560b00cfa86c522d3b05dc87b6eb018e32856784f0857ffa
9353aac4b6660b9a76bedf4c709f7e4515ba5abb0b0643719b9cac5e05b004fd
66c4a4a63832a3c9c464f3e4ade0d8ebaeb72230b3269e013e763f3605b2b5dc
35995543abad1c14e6f3eec1400ade8276e797ed79f1f5a9f620190a5f0c3576
run time is 2 s
```
During these kinds of tests, it might also be useful to monitor your `debug.log` file.

> **Note**
> Ensure you have set the `debug` config parameter to `1` in your `bitcoin.conf` file. This is very useful when developing and debugging.

## Conclusion

In this tutorial we had a look at the `mempool` used by bitcoin for managing a backlog of transaction by each node across the network. We were able to insert and monitor information relating to our own nodes `mempool`.

## Reference

[Bitcoin Wiki](https://en.bitcoin.it/wiki/Address_reuse)
[JSON RPC](https://en.bitcoin.it/wiki/API_reference_(JSON-RPC))
[mempool message](https://github.com/bitcoin/bips/blob/master/bip-0035.mediawiki)

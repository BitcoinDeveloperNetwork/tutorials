#  Setting up a Bitcoin (test) node on Synology NAS

## Introduction

In this simple tutorial, we will be looking at setting up a bitcoin node on Synology NAS, in just a few clicks.

## Background

In a sense, Bitcoin is about claiming back full ownership: your keys, your money. Network Attached Storage is also about claiming full ownership but data this time, not necesseraly money. And considering NAS do most likely have spare GBs and do run 24/7, they are a perfect device to run a bitcoin node on.

### Why Synology?

Because I happen to own one :)

## Let's get started

We first have to create a folder where Docker will store bitcoin data, so just go to File Station, create a "docker" folder in the root of your NAS, and as many folder as node you wanna run, e.g. "bitcoin-mainnet", "bitcoin-testnet", etc...

![](https://i.imgur.com/CdpkwsX.png)

You then have to create a `bitcoin.conf` file and add a few lines as follows:

```
testnet=1                 # optional
rest=1                    # optional, REST API server
txindex=1                 # optional, transaction indexing
disablewallet=1           # for security reasons
printtoconsole=1          # to see logs in Docker interface
rpcuser=yourusername
rpcpassword=yourpassword
```

Access NAS administration page, go to Package Center and install Docker.

![](https://i.imgur.com/nRDd07S.png)

 Now we can start Docker, go to "Registry" and look for "bitcoind". I recommend to download kylemanna image which will simply install bitcoind on an Ubuntu instance and from its official repository - feel free to inspect the code at [Github](https://github.com/kylemanna/docker-bitcoind/blob/master/Dockerfile) 

![](https://i.imgur.com/wiZtXhR.png)

Now go to "Images" within Docker and "Launch" the image you just downloaded. Adjust the name to what suits you and click "Advanced Settings".

![](https://i.imgur.com/gmtcZSJ.png)

You may then want to "Enable auto-restart" to have your node back on in case of OS update, restart.
In "Volume", click "Add Folder", enter your local path in "File/Folder" and "/bitcoin/.bitcoin" as "Mount path".

![](https://i.imgur.com/xHeRvi7.png)

Finally go to "Network" and click to bottom box to "Use the same network as Docker host" if you wanna accept external connection. If not, it may cause your node to ban all incoming connection due to a single misbehaving node - all node would be seen coming from a single IP of the Docker bridge.

Click then "Apply" to validate settings, "Next", and "Apply" to launch your container.

![](https://i.imgur.com/M6LLEI1.png)

Don't forget to open RPC and P2P ports for external access unless you want to remain undercover.
Repeat the process starting at image download to update your node when needed.

## Conclusion

It will take some hours to download the whole blockchain and index transactions for the firsttime but we have a full node running on mainnet, testnet or both in a few minutes. You can now go to sleep while contributing to the bitcoin network or play around with your node, querying for transaction, crawling the network and more.

Have fun

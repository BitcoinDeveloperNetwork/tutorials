#  Running up a Bitcoin node on Synology NAS

## Introduction

In this tutorial, we will be walking through the steps of setting up a bitcoin node docker container on a Synology Network-attached storage (NAS) device in just a few simple steps.

## Background

In a sense, Bitcoin is about claiming back full ownership: your keys, your money. Network-attached storage is also about claiming full ownership over your data. Considering that a typical NAS might likely have spare storage, and typically runs 24/7, this makes them perfect candidates on which to run a bitcoin node.

### Why Synology?

Synology Inc. is a Taiwanese corporation that specialises in Network-attached storage appliances, working with a linux based distribution out of the box, and well I happen to own one :)

## Let's get started

For this tutorial, we will be deploying a bitcoin docker instance using Synology Disk Station Manager (DSM), the linux based operating system running your Synology NAS. Through DSM, you can manage and search files/folders, view files of various types, share private files with external users, mount remote folders and virtual drives for access, and do much more!

To continue, you will need to access your NAS via File Station. The default HTTPS port number is 5001, so you can securely access DiskStation Manager (DSM) by visiting https://server-hostname:5001/, where `server-hostname` is the host or ip address of your NAS.

Once we have successfully accessed the DSM interface, we can continue by creating a folder where Docker will store our bitcoin node data. To do this access File Station, then create a "docker" folder in the root of your NAS. We can then create as many subfolders for each separate node we might want to run, e.g. "bitcoin-mainnet", "bitcoin-testnet", etc..

For the purpose of this tutorial, we will be creating a bitcoin node configured in testnet mode.

![](images/CdpkwsY.png)

You will need to create a `bitcoin.conf` file in the root of each instance you wish to run. In our example, we will be adding a few lines as follows to the `<NASRoot>/docker/bitcoin-testnet/bitcoin.conf` file:

```console
testnet=1                 # optional
rest=1                    # optional, REST API server
txindex=1                 # optional, transaction indexing
disablewallet=1           # for security reasons
printtoconsole=1          # to see logs in Docker interface
rpcuser=yourusername      # to update at your will
rpcpassword=yourpassword  # to update at your will
```

Next, we will need to install docker by accessing the `Package Center` from our NAS administration page. From here search for the "docker" package, then select the install option.

![](images/nRDd07S.png)

 We are now ready to install our bitcoin docker instance by opening the `Docker` package, then selecting `Registry` and searching for "bitcoind". I recommend downloading the `kylemanna` image which will simply install bitcoind on an Ubuntu instance and from its official repository - feel free to inspect the code at [Github](https://github.com/kylemanna/docker-bitcoind/blob/master/Dockerfile)

![](images/wiZtXhR.png)

Next, go to `Images` within Docker and select the `Launch` option of the image you just downloaded. A `Create Container` dialog is shown. You can adjust the name to something which suits your needs e.g. bitcoind. We can leave the other options at default unless you have any specific preferences here. Next, select the `Advanced Settings` option.

![](images/gmtcZSK.png)

To restart your container after an OS update or reboot, select the `Enable auto-restart`.
From the `Volume` tab, select `Add Folder`, enter your local path in `File/Folder` and `/bitcoin/.bitcoin` as `Mount path`.

![](images/xHeRvi9.png)

Next, select the `Network` table, and check the `Use the same network as Docker host` option if you want to accept external connections. Not selecting this option may cause your node to ban all incoming connections due to a single misbehaving node, since all nodes would be seen coming from a single IP over the Docker network bridge.

Finally, select `Apply` to verify your settings, followed by `Next`, and `Apply` to launch your container.

![](images/M6LLEI2.png)

Don't forget to open ports required for the Remote Procedure Call (RPC, default is port 18444) and Peer-to-Peer (P2P) interfaces for external access if required. The following defaults are used based on the network you've configured in your `bitcoin.conf` file.

```console
Mainnet - 8332 (P2P), 8333 (RPC)
Testnet - 18332 (P2P), 18333 (RPC)
Regtest - 18443 (P2P), 18444 (RPC)
```

These defaults can be overridden using the `port` and `rpcport` configuration options.

To upgrade your instance, repeat the process starting at image download when needed. You may also check node logs through Docker interface by going to `Container`, `Details` and `Logs`.

![](images/lk3vv58.png)

## Conclusion

It may take up to a couple of hours to download the whole blockchain and index transactions for the first time, but we have a full node running on testnet in a few minutes. You can now go to sleep while contributing to the bitcoin network, setup another node on mainnet, or play around with your (test)node, querying for transactions, crawling the network or anything else you'd like to do with.

Have fun.

# Building a wallet interface for your node

## Introduction

In this tutorial, we will be building an interface which uses our own node.

## Background

This is my bitcoin node, there are many like it, but this one is mine.

## Getting started

This tutorial assumes you already have a node which is up and running and that has been configured to expose it's RPC interface. You can deploy your own node by running the following.

```console
gr0kchain:~ $ docker volume create --name=bitcoind-data
gr0kchain:~ $ docker run -v bitcoind-data:/bitcoin --name=bitcoind-node -d \
     -p 18444:18444 \
     -p 127.0.0.1:18332:18332 \
     bitcoindevelopernetwork/bitcoind-regtest
```

#



## Conclusion

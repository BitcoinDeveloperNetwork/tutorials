#  Building a Bitcoin REPL

## Introduction

In this tutorial, we will be building our own Read–eval–print loop (REPL) for the bitcoin wire protocol. REPL also termed an interactive toplevel or language shell, is a simple, interactive computer programming environment that takes single user inputs, evaluates them, and returns the result to the user; a program written in a REPL environment is executed piecewise.

## Background

The bitcoin core client currently comes bundles with a `bitcoin-cli` inteface. In our Bitcoin wire protocol 101, we demonstrated how you can communicate over the raw TCP bitcoin socket. In this tutorial we will be taking this a step further by implementing a command line tool which simplifies this process. 

## Let's get started

```console
gr0kchain $ cli.js localhost 18444
Connecting to  localhost 18444
Sending version

Received : 
/Satoshi:0.12.1/
```


## Conclusion

In this tutorial, we walked through the various step of building our very own bitcoin command line REPL. 


## Reference

[GitHub](https://github.com/BitcoinDeveloperNetwork/bitcoin-repl)


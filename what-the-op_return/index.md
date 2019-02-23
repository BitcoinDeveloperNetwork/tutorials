# What the OP_RETURN?!

## Introduction

OP_RETURN is a script opcode used to mark a transaction output as invalid. Since any outputs with OP_RETURN are provably unspendable, OP_RETURN outputs can be used to burn bitcoins.


## Background

Many members of the Bitcoin community believe that use of OP_RETURN is irresponsible in part because Bitcoin was intended to provide a record for financial transactions, not a record for arbitrary data. Additionally, it is trivially obvious that the demand for external, massively-replicated data store is essentially infinite. Despite this, OP_RETURN has the advantage of not creating bogus UTXO entries, compared to some other ways of storing data in the blockchain.

From the Bitcoin Core [release 0.9.0 notes](https://bitcoin.org/bin/insecure/bitcoin-core-0.9.0/README.txt):


> This change is not an endorsement of storing data in the blockchain. The OP_RETURN change creates a provably-prunable output, to avoid data storage schemes – some of which were already deployed – that were storing arbitrary data such as images as forever-unspendable TX outputs, bloating bitcoin's UTXO database.
>
> Storing arbitrary data in the blockchain is still a bad idea; it is less costly and far more efficient to store non-currency data elsewhere.


## Let's get started

Here is a free flow of task oriented information which runs through the steps required.

## Conclusion

In conclusion, we review the goals and purpose of the tutorial.

## Reference

Provide any references related to this tutorial.

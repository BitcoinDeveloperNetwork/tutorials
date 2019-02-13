# Advanced script debugging using the Bitcoin Script Debugger

## Introduction

In this tutorial, we will be going through some scenarios for debugging scripts using the bitcoin script debugger.

## Background

A project I've been working on requires the implementation of [Hashed Time Lock Contracts](https://github.com/bitcoin/bips/blob/master/bip-0199.mediawiki).

## Let's get started

### Creating an HTLC

```console
0100000001d683474abae6d640bc59e70f3ac313ab7ad423d7dbb01d8be7aef5b417573ccb010000006a473044022046d6479146e832bf2d62b925c880701d4bf407406e91c692532b9b9e0c3733ac0220325b29de123f3fe64c899c9597a4d8a9b26a9685d3fb4e1913a26f17f121463a012102b2801b4f56d4377128d59008ab81e1ca27772d90d418347be5ad28b04305b68afeffffff02102700000000000017a9145ab4fda1f905340c368f356ecbf267ab0ea35c0487bc8cff29010000001976a91420cf804a4fa46893e328928c36aa7fac30f61b7088ac82000000
```

### Spending from an HTLC

```console
0100000001cbf53b3df39c87ba4bfd8202f3a9b6358a4e608754665760aa0d40468674801d00000000eb47304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe67ebe95f33022038bcd8fcd1aa015d68c564fa9ac6fcb9535e4f26ad6f8c8721283f23d6adba3b01210284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72207b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf514c5d63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f98876a9146353885779440fb7ecb394453ace1268dba9ec3f670431de8257b17576a9146353885779440fb7ecb394453ace1268dba9ec3f6888ac0000000001d0240000000000001976a9146353885779440fb7ecb394453ace1268dba9ec3f88ac00000000```

```
gr0kchain:~ $ bitcoin-cli decoderawtransaction 0100000001cbf53b3df39c87ba4bfd8202f3a9b6358a4e608754665760aa0d40468674801d00000000eb47304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe67ebe95f33022038bcd8fcd1aa015d68c564fa9ac6fcb9535e4f26ad6f8c8721283f23d6adba3b01210284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72207b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf514c5d63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f98876a9146353885779440fb7ecb394453ace1268dba9ec3f670431de8257b17576a9146353885779440fb7ecb394453ace1268dba9ec3f6888ac0000000001d0240000000000001976a9146353885779440fb7ecb394453ace1268dba9ec3f88ac00000000

`console
gr0kchain:~ $ bitcoin-cli decoderawtransaction 0100000001cbf53b3df39c87ba4bfd8202f3a9b6358a4e608754665760aa0d40468674801d00000000eb47304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe67ebe95f33022038bcd8fcd1aa015d68c564fa9ac6fcb9535e4f26ad6f8c8721283f23d6adba3b01210284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72207b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf514c5d63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f98876a9146353885779440fb7ecb394453ace1268dba9ec3f670431de8257b17576a9146353885779440fb7ecb394453ace1268dba9ec3f6888ac0000000001d0240000000000001976a9146353885779440fb7ecb394453ace1268dba9ec3f88ac00000000
{
  "txid": "46f37d88f97c3a1848d445bd329fbe88a7e7c56a63af5048d4c08bc320151417",
  "size": 320,
  "version": 1,
  "locktime": 0,
  "vin": [
    {
      "txid": "1d80748646400daa6057665487604e8a35b6a9f30282fd4bba879cf33d3bf5cb",
      "vout": 0,
      "scriptSig": {
        "asm": "304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe67ebe95f33022038bcd8fcd1aa015d68c564fa9ac6fcb9535e4f26ad6f8c8721283f23d6adba3b[ALL] 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72 7b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf 1 63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f98876a9146353885779440fb7ecb394453ace1268dba9ec3f670431de8257b17576a9146353885779440fb7ecb394453ace1268dba9ec3f6888ac",
        "hex": "47304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe67ebe95f33022038bcd8fcd1aa015d68c564fa9ac6fcb9535e4f26ad6f8c8721283f23d6adba3b01210284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72207b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf514c5d63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f98876a9146353885779440fb7ecb394453ace1268dba9ec3f670431de8257b17576a9146353885779440fb7ecb394453ace1268dba9ec3f6888ac"
      },
      "sequence": 0
    }
  ],
  "vout": [
    {
      "value": 0.00009424,
      "valueSat": 9424,
      "n": 0,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 6353885779440fb7ecb394453ace1268dba9ec3f OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a9146353885779440fb7ecb394453ace1268dba9ec3f88ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "mpa9FzRstvhEmY4RYRo4aSnEA5TKKb2gik"
        ]
      }
    }
  ]
}`

```console
Judas:cli h4v0k$ bitcoin-cli getrawtransaction 1d80748646400daa6057665487604e8a35b6a9f30282fd4bba879cf33d3bf5cb
0100000001d683474abae6d640bc59e70f3ac313ab7ad423d7dbb01d8be7aef5b417573ccb010000006a473044022046d6479146e832bf2d62b925c880701d4bf407406e91c692532b9b9e0c3733ac0220325b29de123f3fe64c899c9597a4d8a9b26a9685d3fb4e1913a26f17f121463a012102b2801b4f56d4377128d59008ab81e1ca27772d90d418347be5ad28b04305b68afeffffff02102700000000000017a9145ab4fda1f905340c368f356ecbf267ab0ea35c0487bc8cff29010000001976a91420cf804a4fa46893e328928c36aa7fac30f61b7088ac82000000
```


```console
Judas:cli h4v0k$ bitcoin-cli decoderawtransaction 0100000001d683474abae6d640bc59e70f3ac313ab7ad423d7dbb01d8be7aef5b417573ccb010000006a473044022046d6479146e832bf2d62b925c880701d4bf407406e91c692532b9b9e0c3733ac0220325b29de123f3fe64c899c9597a4d8a9b26a9685d3fb4e1913a26f17f121463a012102b2801b4f56d4377128d59008ab81e1ca27772d90d418347be5ad28b04305b68afeffffff02102700000000000017a9145ab4fda1f905340c368f356ecbf267ab0ea35c0487bc8cff29010000001976a91420cf804a4fa46893e328928c36aa7fac30f61b7088ac82000000
{
  "txid": "1d80748646400daa6057665487604e8a35b6a9f30282fd4bba879cf33d3bf5cb",
  "size": 223,
  "version": 1,
  "locktime": 130,
  "vin": [
    {
      "txid": "cb3c5717b4f5aee78b1db0dbd723d47aab13c33a0fe759bc40d6e6ba4a4783d6",
      "vout": 1,
      "scriptSig": {
        "asm": "3044022046d6479146e832bf2d62b925c880701d4bf407406e91c692532b9b9e0c3733ac0220325b29de123f3fe64c899c9597a4d8a9b26a9685d3fb4e1913a26f17f121463a[ALL] 02b2801b4f56d4377128d59008ab81e1ca27772d90d418347be5ad28b04305b68a",
        "hex": "473044022046d6479146e832bf2d62b925c880701d4bf407406e91c692532b9b9e0c3733ac0220325b29de123f3fe64c899c9597a4d8a9b26a9685d3fb4e1913a26f17f121463a012102b2801b4f56d4377128d59008ab81e1ca27772d90d418347be5ad28b04305b68a"
      },
      "sequence": 4294967294
    }
  ],
  "vout": [
    {
      "value": 0.00010000,
      "valueSat": 10000,
      "n": 0,
      "scriptPubKey": {
        "asm": "OP_HASH160 5ab4fda1f905340c368f356ecbf267ab0ea35c04 OP_EQUAL",
        "hex": "a9145ab4fda1f905340c368f356ecbf267ab0ea35c0487",
        "reqSigs": 1,
        "type": "scripthash",
        "addresses": [
          "2N1Wqd1LdzHAcYt4ZquugkYKD6HADhL1vNo"
        ]
      }
    },
    {
      "value": 49.99580860,
      "valueSat": 4999580860,
      "n": 1,
      "scriptPubKey": {
        "asm": "OP_DUP OP_HASH160 20cf804a4fa46893e328928c36aa7fac30f61b70 OP_EQUALVERIFY OP_CHECKSIG",
        "hex": "76a91420cf804a4fa46893e328928c36aa7fac30f61b7088ac",
        "reqSigs": 1,
        "type": "pubkeyhash",
        "addresses": [
          "miWSVd9qLs4VEaCZfFNa7Z1533nyPJHYae"
        ]
      }
    }
  ]
}
```

tx=0100000001cbf53b3df39c87ba4bfd8202f3a9b6358a4e608754665760aa0d40468674801d00000000eb47304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe67ebe95f33022038bcd8fcd1aa015d68c564fa9ac6fcb9535e4f26ad6f8c8721283f23d6adba3b01210284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72207b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf514c5d63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f98876a9146353885779440fb7ecb394453ace1268dba9ec3f670431de8257b17576a9146353885779440fb7ecb394453ace1268dba9ec3f6888ac0000000001d0240000000000001976a9146353885779440fb7ecb394453ace1268dba9ec3f88ac00000000

txin=0100000001d683474abae6d640bc59e70f3ac313ab7ad423d7dbb01d8be7aef5b417573ccb010000006a473044022046d6479146e832bf2d62b925c880701d4bf407406e91c692532b9b9e0c3733ac0220325b29de123f3fe64c899c9597a4d8a9b26a9685d3fb4e1913a26f17f121463a012102b2801b4f56d4377128d59008ab81e1ca27772d90d418347be5ad28b04305b68afeffffff02102700000000000017a9145ab4fda1f905340c368f356ecbf267ab0ea35c0487bc8cff29010000001976a91420cf804a4fa46893e328928c36aa7fac30f61b7088ac82000000

```console
btcdeb --txin=0100000001d683474abae6d640bc59e70f3ac313ab7ad423d7dbb01d8be7aef5b417573ccb010000006a473044022046d6479146e832bf2d62b925c880701d4bf407406e91c692532b9b9e0c3733ac0220325b29de123f3fe64c899c9597a4d8a9b26a9685d3fb4e1913a26f17f121463a012102b2801b4f56d4377128d59008ab81e1ca27772d90d418347be5ad28b04305b68afeffffff02102700000000000017a9145ab4fda1f905340c368f356ecbf267ab0ea35c0487bc8cff29010000001976a91420cf804a4fa46893e328928c36aa7fac30f61b7088ac82000000 --tx=0100000001cbf53b3df39c87ba4bfd8202f3a9b6358a4e608754665760aa0d40468674801d00000000eb47304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe67ebe95f33022038bcd8fcd1aa015d68c564fa9ac6fcb9535e4f26ad6f8c8721283f23d6adba3b01210284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72207b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf514c5d63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f98876a9146353885779440fb7ecb394453ace1268dba9ec3f670431de8257b17576a9146353885779440fb7ecb394453ace1268dba9ec3f6888ac0000000001d0240000000000001976a9146353885779440fb7ecb394453ace1268dba9ec3f88ac00000000
```

```console
Judas:cli h4v0k$ btcdeb --txin=0100000001d683474abae6d640bc59e70f3ac313ab7ad423d7dbb01d8be7aef5b417573ccb010000006a473044022046d6479146e832bf2d62b925c880701d4bf407406e91c692532b9b9e0c3733ac0220325b29de123f3fe64c899c9597a4d8a9b26a9685d3fb4e1913a26f17f121463a012102b2801b4f56d4377128d59008ab81e1ca27772d90d418347be5ad28b04305b68afeffffff02102700000000000017a9145ab4fda1f905340c368f356ecbf267ab0ea35c0487bc8cff29010000001976a91420cf804a4fa46893e328928c36aa7fac30f61b7088ac82000000 --tx=0100000001cbf53b3df39c87ba4bfd8202f3a9b6358a4e608754665760aa0d40468674801d00000000eb47304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe67ebe95f33022038bcd8fcd1aa015d68c564fa9ac6fcb9535e4f26ad6f8c8721283f23d6adba3b01210284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72207b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf514c5d63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f98876a9146353885779440fb7ecb394453ace1268dba9ec3f670431de8257b17576a9146353885779440fb7ecb394453ace1268dba9ec3f6888ac0000000001d0240000000000001976a9146353885779440fb7ecb394453ace1268dba9ec3f88ac00000000
btcdeb -- type `btcdeb -h` for start up options
got transaction 46f37d88f97c3a1848d445bd329fbe88a7e7c56a63af5048d4c08bc320151417:
CTransaction(hash=46f37d88f9, ver=1, vin.size=1, vout.size=1, nLockTime=0)
    CTxIn(COutPoint(1d80748646, 0), scriptSig=47304402202e705286c70c4e, nSequence=0)
    CScriptWitness()
    CTxOut(nValue=0.00009424, scriptPubKey=76a9146353885779440fb7ecb39445)

got input tx #0 1d80748646400daa6057665487604e8a35b6a9f30282fd4bba879cf33d3bf5cb:
CTransaction(hash=1d80748646, ver=1, vin.size=1, vout.size=2, nLockTime=130)
    CTxIn(COutPoint(cb3c5717b4, 1), scriptSig=473044022046d6479146e832, nSequence=4294967294)
    CScriptWitness()
    CTxOut(nValue=0.00010000, scriptPubKey=a9145ab4fda1f905340c368f356ecb)
    CTxOut(nValue=49.99580860, scriptPubKey=76a91420cf804a4fa46893e328928c)

input tx index = 0; tx input vout = 0; value = 10000
27 op script loaded. type `help` for usage information
script                                                             |  stack
-------------------------------------------------------------------+--------
304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6... |
0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72 |
7b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf   |
1                                                                  |
63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a211... |
<<< scriptPubKey >>>                                               |
OP_HASH160                                                         |
5ab4fda1f905340c368f356ecbf267ab0ea35c04                           |
OP_EQUAL                                                           |
<<< P2SH script >>>                                                |
OP_IF                                                              |
OP_SHA256                                                          |
261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9   |
OP_EQUALVERIFY                                                     |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ELSE                                                            |
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0000 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe67ebe95f33022038bcd8fcd1aa015d68c564fa9ac6fcb9535e4f26ad6f8c8721283f23d6adba3b01
btcdeb> step
		<> PUSH stack 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe67ebe95f33022038bcd8fcd1aa015d68c564fa9ac6fcb9535e4f26ad6f8c8721283f23d6adba3b01
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72 | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
7b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf   |
1                                                                  |
63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a211... |
<<< scriptPubKey >>>                                               |
OP_HASH160                                                         |
5ab4fda1f905340c368f356ecbf267ab0ea35c04                           |
OP_EQUAL                                                           |
<<< P2SH script >>>                                                |
OP_IF                                                              |
OP_SHA256                                                          |
261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9   |
OP_EQUALVERIFY                                                     |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ELSE                                                            |
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0001 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
btcdeb> step
		<> PUSH stack 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
7b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf   | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
1                                                                  | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a211... |
<<< scriptPubKey >>>                                               |
OP_HASH160                                                         |
5ab4fda1f905340c368f356ecbf267ab0ea35c04                           |
OP_EQUAL                                                           |
<<< P2SH script >>>                                                |
OP_IF                                                              |
OP_SHA256                                                          |
261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9   |
OP_EQUALVERIFY                                                     |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ELSE                                                            |
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0002 7b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf
btcdeb> step
		<> PUSH stack 7b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
1                                                                  |   7b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf
63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a211... | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
<<< scriptPubKey >>>                                               | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_HASH160                                                         |
5ab4fda1f905340c368f356ecbf267ab0ea35c04                           |
OP_EQUAL                                                           |
<<< P2SH script >>>                                                |
OP_IF                                                              |
OP_SHA256                                                          |
261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9   |
OP_EQUALVERIFY                                                     |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ELSE                                                            |
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0003 1
btcdeb> step
		<> PUSH stack 01
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a211... |                                                                 01
<<< scriptPubKey >>>                                               |   7b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf
OP_HASH160                                                         | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
5ab4fda1f905340c368f356ecbf267ab0ea35c04                           | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_EQUAL                                                           |
<<< P2SH script >>>                                                |
OP_IF                                                              |
OP_SHA256                                                          |
261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9   |
OP_EQUALVERIFY                                                     |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ELSE                                                            |
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0004 63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f98876a9146353885779440fb7ecb394453ace1268dba9ec3f670431de8257b17576a9146353885779440fb7ecb394453ace1268dba9ec3f6888ac
btcdeb> step
		<> PUSH stack 63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f98876a9146353885779440fb7ecb394453ace1268dba9ec3f670431de8257b17576a9146353885779440fb7ecb394453ace1268dba9ec3f6888ac
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
<<< scriptPubKey >>>                                               | 63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a211...
OP_HASH160                                                         |                                                                 01
5ab4fda1f905340c368f356ecbf267ab0ea35c04                           |   7b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf
OP_EQUAL                                                           | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
<<< P2SH script >>>                                                | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_IF                                                              |
OP_SHA256                                                          |
261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9   |
OP_EQUALVERIFY                                                     |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ELSE                                                            |
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
<<< scriptPubKey >>>
btcdeb> step
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
OP_HASH160                                                         | 63a820261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a211...
5ab4fda1f905340c368f356ecbf267ab0ea35c04                           |                                                                 01
OP_EQUAL                                                           |   7b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf
<<< P2SH script >>>                                                | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
OP_IF                                                              | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_SHA256                                                          |
261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9   |
OP_EQUALVERIFY                                                     |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ELSE                                                            |
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0006 OP_HASH160
btcdeb> step
		<> POP  stack
		<> PUSH stack 5ab4fda1f905340c368f356ecbf267ab0ea35c04
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
5ab4fda1f905340c368f356ecbf267ab0ea35c04                           |                           5ab4fda1f905340c368f356ecbf267ab0ea35c04
OP_EQUAL                                                           |                                                                 01
<<< P2SH script >>>                                                |   7b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf
OP_IF                                                              | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
OP_SHA256                                                          | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9   |
OP_EQUALVERIFY                                                     |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ELSE                                                            |
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0007 5ab4fda1f905340c368f356ecbf267ab0ea35c04
btcdeb> step
		<> PUSH stack 5ab4fda1f905340c368f356ecbf267ab0ea35c04
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
OP_EQUAL                                                           |                           5ab4fda1f905340c368f356ecbf267ab0ea35c04
<<< P2SH script >>>                                                |                           5ab4fda1f905340c368f356ecbf267ab0ea35c04
OP_IF                                                              |                                                                 01
OP_SHA256                                                          |   7b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf
261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9   | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
OP_EQUALVERIFY                                                     | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ELSE                                                            |
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0008 OP_EQUAL
btcdeb> step
		<> POP  stack
		<> POP  stack
		<> PUSH stack 01
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
<<< P2SH script >>>                                                |                                                                 01
OP_IF                                                              |                                                                 01
OP_SHA256                                                          |   7b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf
261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9   | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
OP_EQUALVERIFY                                                     | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ELSE                                                            |
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
<<< P2SH script >>>
btcdeb> step
		<> POP  stack
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
OP_IF                                                              |                                                                 01
OP_SHA256                                                          |   7b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf
261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9   | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
OP_EQUALVERIFY                                                     | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ELSE                                                            |
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0010 OP_IF
btcdeb> step
		<> POP  stack
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
OP_SHA256                                                          |   7b3764fdc43ca62a524adfafc9b86c8e4a4962d330362f0dec76fa45d707b5bf
261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9   | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
OP_EQUALVERIFY                                                     | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ELSE                                                            |
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0011 OP_SHA256
btcdeb> step
		<> POP  stack
		<> PUSH stack 261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9   |   261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9
OP_EQUALVERIFY                                                     | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
OP_DUP                                                             | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ELSE                                                            |
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0012 261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9
btcdeb> step
		<> PUSH stack 261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
OP_EQUALVERIFY                                                     |   261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9
OP_DUP                                                             |   261350558f7c85da699ad830a801c7c3747f3a7bb82cd5aff71f0a21108cd8f9
OP_HASH160                                                         | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
6353885779440fb7ecb394453ace1268dba9ec3f                           | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_ELSE                                                            |
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0013 OP_EQUALVERIFY
btcdeb> step
		<> POP  stack
		<> POP  stack
		<> PUSH stack 01
		<> POP  stack
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
OP_DUP                                                             | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
OP_HASH160                                                         | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ELSE                                                            |
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0014 OP_DUP
btcdeb> step
		<> PUSH stack 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
OP_HASH160                                                         | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
6353885779440fb7ecb394453ace1268dba9ec3f                           | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
OP_ELSE                                                            | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
31de8257                                                           |
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0015 OP_HASH160
btcdeb> step
		<> POP  stack
		<> PUSH stack 6353885779440fb7ecb394453ace1268dba9ec3f
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
6353885779440fb7ecb394453ace1268dba9ec3f                           |                           6353885779440fb7ecb394453ace1268dba9ec3f
OP_ELSE                                                            | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
31de8257                                                           | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_CHECKLOCKTIMEVERIFY                                             |
OP_DROP                                                            |
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0016 6353885779440fb7ecb394453ace1268dba9ec3f
btcdeb> step
		<> PUSH stack 6353885779440fb7ecb394453ace1268dba9ec3f
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
OP_ELSE                                                            |                           6353885779440fb7ecb394453ace1268dba9ec3f
31de8257                                                           |                           6353885779440fb7ecb394453ace1268dba9ec3f
OP_CHECKLOCKTIMEVERIFY                                             | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
OP_DROP                                                            | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_DUP                                                             |
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0017 OP_ELSE
btcdeb> step
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
31de8257                                                           |                           6353885779440fb7ecb394453ace1268dba9ec3f
OP_CHECKLOCKTIMEVERIFY                                             |                           6353885779440fb7ecb394453ace1268dba9ec3f
OP_DROP                                                            | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
OP_DUP                                                             | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_HASH160                                                         |
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0018 31de8257
btcdeb> step
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
OP_CHECKLOCKTIMEVERIFY                                             |                           6353885779440fb7ecb394453ace1268dba9ec3f
OP_DROP                                                            |                           6353885779440fb7ecb394453ace1268dba9ec3f
OP_DUP                                                             | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
OP_HASH160                                                         | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
6353885779440fb7ecb394453ace1268dba9ec3f                           |
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0019 OP_CHECKLOCKTIMEVERIFY
btcdeb> step
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
OP_DROP                                                            |                           6353885779440fb7ecb394453ace1268dba9ec3f
OP_DUP                                                             |                           6353885779440fb7ecb394453ace1268dba9ec3f
OP_HASH160                                                         | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
6353885779440fb7ecb394453ace1268dba9ec3f                           | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_ENDIF                                                           |
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0020 OP_DROP
btcdeb> step
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
OP_DUP                                                             |                           6353885779440fb7ecb394453ace1268dba9ec3f
OP_HASH160                                                         |                           6353885779440fb7ecb394453ace1268dba9ec3f
6353885779440fb7ecb394453ace1268dba9ec3f                           | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
OP_ENDIF                                                           | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_EQUALVERIFY                                                     |
OP_CHECKSIG                                                        |
#0021 OP_DUP
btcdeb> stpe
stpe: No such command.
btcdeb> stpe
stpe: No such command.
btcdeb> stpe
stpe: No such command.
btcdeb> step
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
OP_HASH160                                                         |                           6353885779440fb7ecb394453ace1268dba9ec3f
6353885779440fb7ecb394453ace1268dba9ec3f                           |                           6353885779440fb7ecb394453ace1268dba9ec3f
OP_ENDIF                                                           | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
OP_EQUALVERIFY                                                     | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
OP_CHECKSIG                                                        |
#0022 OP_HASH160
btcdeb> step
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
6353885779440fb7ecb394453ace1268dba9ec3f                           |                           6353885779440fb7ecb394453ace1268dba9ec3f
OP_ENDIF                                                           |                           6353885779440fb7ecb394453ace1268dba9ec3f
OP_EQUALVERIFY                                                     | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
OP_CHECKSIG                                                        | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
#0023 6353885779440fb7ecb394453ace1268dba9ec3f
btcdeb> step
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
OP_ENDIF                                                           |                           6353885779440fb7ecb394453ace1268dba9ec3f
OP_EQUALVERIFY                                                     |                           6353885779440fb7ecb394453ace1268dba9ec3f
OP_CHECKSIG                                                        | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
                                                                   | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
#0024 OP_ENDIF
btcdeb> step
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
OP_EQUALVERIFY                                                     |                           6353885779440fb7ecb394453ace1268dba9ec3f
OP_CHECKSIG                                                        |                           6353885779440fb7ecb394453ace1268dba9ec3f
                                                                   | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
                                                                   | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
#0025 OP_EQUALVERIFY
btcdeb> step
		<> POP  stack
		<> POP  stack
		<> PUSH stack 01
		<> POP  stack
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
OP_CHECKSIG                                                        | 0284771cb7afc90713e5c3546592df859f35fcb7a54f4bd4398ad70b5e0055ed72
                                                                   | 304402202e705286c70c4e23f972d9f5ac47affea1d16fabd7a7b338d70cfe6...
#0026 OP_CHECKSIG
btcdeb> step
		<> POP  stack
		<> POP  stack
		<> PUSH stack 01
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
                                                                   |                                                                 01
btcdeb> step
script                                                             |                                                             stack
-------------------------------------------------------------------+-------------------------------------------------------------------
                                                                   |                                                                 01
btcdeb> step
at end of script
btcdeb>
```

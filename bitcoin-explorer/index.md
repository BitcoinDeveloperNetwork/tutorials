# Bitcoin Explorer and libbitcoin

## Introduction

In this tutorial, we will be covering `libbitcoin`, a suite of bitcoin developer nodes,


## Background

The libbitcoin toolkit is a set of cross platform C++ libraries for building bitcoin applications. The toolkit consists of several libraries, most of which depend on the foundational libbitcoin library. Each library's repository can be cloned and built using common Automake instructions.

```console
gr0kchain $ bx seed | bx ec-new | bx ec-to-public | bx ec-to-address
13ua8RRSxLpL5WL5cKUDepUCvJZgGWuKh7
```
> BX is a command line tool for working with Bitcoin. It can be built as a single portable executable for Linux, macOS or Windows and is available for download as a signed single executable for each. BX exposes over 80 commands and supports network communication with libbitcoin-server or its predecessor Obelisk, and the P2P Bitcoin network. BX is well documented and supports simple and advanced scenarios, including stealth and multisig.

## Installing

There are two components needed for this tutorial, the first a our bitcoin explorer command line tool (bx), and access to a libbitcoin server instance.

You can install your own copy by following these instructions.


Alternatively, there are various community servers [available](https://github.com/libbitcoin/libbitcoin-server/wiki/Community-Servers). Including our [own]().

For the purpose of experimentation, we recommend using a copy of this configured in [regtest](https://github.com/libbitcoin/libbitcoin-server/wiki/Regtest-Configuration) mode.

You will also need to domain a copy of the

## Let's get started

As of version 3.2.0, the `bx` command has around 87 commands. We'll explore some of these so that you can get the hang of where you might want to use it.



### Generating an address

The `bx` command includes various commands which allow us to do interesting bitcoin related things, one of which is generating an address.

Let's start with generating a pseudorandom seed for as [entropy](https://en.wikipedia.org/wiki/Entropy) for our private key.

```console
gr0kchain@bitcoindev $ bx seed
bc22b367071fb6c72965b809cf2b11817e0eaea27d06523d
```
> WARNING: Pseudorandom seeding can introduce cryptographic weakness into your keys. This command is provided as a convenience.

Now we can generate private key using our generate entropy.

```console
gr0kchain@bitcoindev $ bx ec-new bc22b367071fb6c72965b809cf2b11817e0eaea27d06523d
c93fc696e57e69462dfc13b3986be443f470ad8ad8b2bb084c31d1f874a0e934
```

Next, we derive a public key from the private key

```console
gr0kchain@bitcoindev $ bx ec-to-public c93fc696e57e69462dfc13b3986be443f470ad8ad8b2bb084c31d1f874a0e934
038f0c6d3100303b560cb718bdc4a8224a866e9a264cc99ffa5bee6ac83d103d24
```

> Defaults to the [compressed public key](https://bitcoin.org/en/glossary/compressed-public-key) format

Generate an address from the public key

```console
gr0kchain@bitcoindev $ bx ec-to-address 038f0c6d3100303b560cb718bdc4a8224a866e9a264cc99ffa5bee6ac83d103d24
1ERgdZfHU1MZyn6BgyVEGSbBgbzTa39uQa
```

The bx command also follows the unix philosophy of minimalism and modularity, where it focussing on doing one thing, and doing it well. This allows you to combined the above processes

```console
gr0kchain@bitcoindev $ bx seed | bx ec-new | bx ec-to-public | bx ec-to-address
1AoPnzTFUr6EoyNTsHWi2nqRZxgtJx89RD
```

We can also generate a [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) mnemonic phrase.

```console
gr0kchain@bitcoindev $ bx seed | bx mnemonic-new
shove morning usage area fox knee diary else explain blush pupil awful funny sphere tower rose budget half
```

We can also increase the security of our seed

```console
gr0kchain@bitcoindev $ bx seed -b 256 | bx mnemonic-new
wait chuckle orchard digital section seminar loud dust dog very exclude lift resource clinic between soup match stand room leopard cute expose advance social
```

```console
gr0kchain@bitcoindev $ bx qrcode -p 131zKT2n1FN4Z6JdDAWMg3w8ehYjoRByTB | imgcat
```
![](assets/131zKT2n1FN4Z6JdDAWMg3w8ehYjoRByTB.png)



## More information


```console
gr0kchain@bitcoindev $ bx help

Usage: bx COMMAND [--help]

Version: 3.2.0

Info: The bx commands are:

address-decode
address-embed
address-encode
base16-decode
base16-encode
base58-decode
base58-encode
base58check-decode
base58check-encode
base64-decode
base64-encode
bitcoin160
bitcoin256
btc-to-satoshi
cert-new
cert-public
ec-add
ec-add-secrets
ec-multiply
ec-multiply-secrets
ec-new
ec-to-address
ec-to-ek
ec-to-public
ec-to-wif
ek-address
ek-new
ek-public
ek-public-to-address
ek-public-to-ec
ek-to-address
ek-to-ec
fetch-balance
fetch-header
fetch-height
fetch-history
fetch-public-key
fetch-stealth
fetch-tx
fetch-tx-index
fetch-utxo
hd-new
hd-private
hd-public
hd-to-ec
hd-to-public
help
input-set
input-sign
input-validate
message-sign
message-validate
mnemonic-new
mnemonic-to-seed
qrcode
ripemd160
satoshi-to-btc
script-decode
script-encode
script-to-address
seed
send-tx
send-tx-node
send-tx-p2p
settings
sha160
sha256
sha512
stealth-decode
stealth-encode
stealth-public
stealth-secret
stealth-shared
token-new
tx-decode
tx-encode
tx-sign
uri-decode
uri-encode
validate-tx
watch-address
watch-stealth
watch-tx
wif-to-ec
wif-to-public
wrap-decode
wrap-encode

Bitcoin Explorer home page:

https://github.com/libbitcoin/libbitcoin-explorer
```

You can also get help for a specific command by passing it as the first parameter to the help command.

```console
gr0kchain@bitcoindev $ bx help seed

Usage: bx seed [-h] [--bit_length value] [--config value]

Info: Generate a pseudorandom seed.

Options (named):

-b [--bit_length]    The length of the seed in bits. Must be divisible by
                     8 and must not be less than 128, defaults to 192.
-c [--config]        The path to the configuration settings file.
-h [--help]          Get a description and instructions for this command.
```

## Conclusion

In conclusion, we review the goals and purpose of the tutorial.

## Reference

[Libbitcoin Bitcoin Explorer](https://github.com/libbitcoin/libbitcoin-explorer)
[Libbitcoin Server](https://github.com/libbitcoin/libbitcoin-server)
[Bitcoin Explorer Wiki](https://github.com/libbitcoin/libbitcoin-explorer/wiki)
[Libbitcoin.org](https://libbitcoin.org/)

#  Using GPG as a Bitcoin address

## Introduction

This tutorial will guide you through experimenting with GnuPG and raw bitcoin transactions based on my own experience.

We will demonstrate how to derive a bitcoin address from a PGP public key, create a bitcoin transaction, sign it with corresponding private key and finally broadcast it to the network.

## Background

Following the [addition](https://git.gnupg.org/cgi-bin/gitweb.cgi?p=gnupg.git;a=commit;h=c5e41f539b9a21cbad10c7dae95572a4445d31c3) of secp256k1 elliptic curve support to GnuPGP in early 2014, and the recent merge of [BIP174](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki) for enabling partially signed bitcoin transaction (PSBT), it appears possible to use OpenPGP cards to store bitcoin private key in the tamper-resistant and PIN-protected device.

We will be using GnuPG v2.2.12 and Julia v1.1.

You will also need to add the `PGPacket` and `Bitcoin` package as follows.

Since `PGPacket` has not been released as an official package yet, we will need to add its repository manually. In Julia, invoke the package menu by typing `]` then add the pgppackget.jl.git repository, finally hit `backspace` to get back to the julia command line.

```julia
(v1.1) pkg> add https://gitlab.com/braneproject/pgpacket.jl.git
```

Next, we will prepare our environment by importing the libraries required for this tutorial.

```
julia> using Pkg
julia> Pkg.add("PGPacket")
julia> Pkg.add("Bitcoin")
julia> using PGPacket, Bitcoin, Base58, ECC
```

## Let's get started

### Generate a key pair

We first have to create a key pair with GnuPG, using ECC and secp256k1 curve. We will simply run gpg with the `--full-generate-key` command and `--expert` option. Once we've invoked the GnuPG interactive menu, select options `10`, `9`, `0`, `y`, and finalise with user details at your will. To ease the experiment, do not enter setup passphrase for this key, it will allow us to export an unencrypted private key.

```shell
$ gpg --expert --full-generate-key
gpg (GnuPG) 2.2.12; Copyright (C) 2018 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Please select what kind of key you want:
   (1) RSA and RSA (default)
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
   (9) ECC and ECC
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (13) Existing key
Your selection? 10
Please select which elliptic curve you want:
   (1) Curve 25519
   (3) NIST P-256
   (4) NIST P-384
   (5) NIST P-521
   (6) Brainpool P-256
   (7) Brainpool P-384
   (8) Brainpool P-512
   (9) secp256k1
Your selection? 9
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 0
Key does not expire at all
Is this correct? (y/N) y

GnuPG needs to construct a user ID to identify your key.

Real name: bitcoin pgp 001
Email address:
Comment:
You selected this USER-ID:
    "bitcoin pgp 001"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
gpg: key 576C7094D11A1378 marked as ultimately trusted
gpg: revocation certificate stored as '/home/simon/.gnupg/openpgp-revocs.d/5E0BE9CCE55D5494495E0A0CB52EF617C8114CBC.rev'
public and secret key created and signed.

pub   secp256k1 2019-02-03 [SC]
      5E0BE9CCE55D5494495E0A0CB52EF617C8114CBC
uid                      bitcoin pgp 001

```

> **Note**
> GnuPG manages files at `~/.gnupg/` as a default location.
> ```shell
> $ tree ~/.gnupg/
/home/simon/.gnupg/
├── S.gpg-agent
├── S.gpg-agent.browser
├── S.gpg-agent.extra
├── S.gpg-agent.ssh
├── openpgp-revocs.d
│   └── 5E0BE9CCE55D5494495E0A0CB52EF617C8114CBC.rev
├── private-keys-v1.d
│   └── 576C7094D11A13788F5CABFA0D6E9DAEBC3DC88B.key
├── pubring.kbx
├── pubring.kbx~
└── trustdb.gpg
> ```

### Export Public Key

Extracting our binary from GnuPG is straight forward and can be done with the following command.

1. Retrieve a list of available keys
  ```shell
  $ gpg -k
  gpg: checking the trustdb
  gpg: marginals needed: 3  completes needed: 1  trust model: pgp
  gpg: depth: 0  valid:   1  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 1u
  /home/simon/.gnupg/pubring.kbx
  -------------------------------
  pub   secp256k1 2019-03-02 [SC]
        5E0BE9CCE55D5494495E0A0CB52EF617C8114CBC
  uid           [ultimate] bitcoin pgp 001
  ```

2. We can then export the public key by first generating a binary file with GnuPG and parsing its content with julia (python or any other language would most likely achieve the same).

  ```shell
  $ gpg --output pubkey.bin --export 5E0BE9CCE55D5494495E0A0CB52EF617C8114CBC
  ```

  Parsing the resulting file requires going through [RFC4880bis](https://tools.ietf.org/html/draft-ietf-openpgp-rfc4880bis-06) which is rather long and not in scope for this tutorial.

  We will use the function `bin2packet` which interprets PGP messages and allows for extracting our ECDSA key and signature. Source code of the later function can be found at [GitLab](https://gitlab.com/braneproject/pgpacket.jl).

  > **Note**
  > This is highly experimental and untested, use at your own risk!

3. With the public key packet we are able to extract a point on an scep256k1 curve.

  ```julia
  julia> packet = bin2packet("pubkey.bin")[1]
  3-element Array{PGPPacket,1}:
   Public-Key Packet
   Length : 79, Partial : false
  PublicKey(0x04, 1550079457, scep256k1 Point(𝑥,𝑦):
  f05314566c9bfc8d8cf463a7a01e7735245d588a60dd874f09a9636620abb314,
  6bda245d43cbbe019ab1ad74316d675dd858cdd776820969bcc21bbccbd3a661)

  julia> pubkey = packet.body.pubkey
  scep256k1 Point(𝑥,𝑦):
  f05314566c9bfc8d8cf463a7a01e7735245d588a60dd874f09a9636620abb314,
  6bda245d43cbbe019ab1ad74316d675dd858cdd776820969bcc21bbccbd3a661
  ```

4. From that public key, we can compute the corresponding bitcoin address using the `Bitcoin` package in Julia. We are here using `true` as second and third function arguments to generate a compressed address on testnet.

  ```julia
  julia> address(pubkey, true, true)
  "moZ5AGrmGEFD4rCgSK2Vau46RjjsZpgmNo"
   ```
We now have a bitcoin testnet address derived from GPG public key!

### Construct transaction

First send some bitcoin to your test address and use a block explorer to identify incoming transaction. In this case it is transaction [bf...47](https://live.blockcypher.com/btc-testnet/tx/bfd8209364e0fe275c30829391207d89fc1c480c6148caf37e5d612728f43247/) at index 0.

1. Create a transaction input.

  ```julia
  julia> tx_ins = TxIn[];
  julia> prev_tx = hex2bytes("bfd8209364e0fe275c30829391207d89fc1c480c6148caf37e5d612728f43247");
  julia> push!(tx_ins, TxIn(prev_tx, 0));
  ```

2. We then need to create transaction outputs, one to a destination address.

  ```julia
  julia> target_address = b"mv4rnyY3Su5gjcDNzbMLKBQkBicCtHUtFB";
  julia> tx_outs = TxOut[];
  julia> h160 = base58checkdecode(target_address)[2:end];
  julia> script_pubkey = Bitcoin.p2pkh_script(h160);
  julia> target_amount = 0.01;
  julia> target_satoshis = Int(target_amount*100000000);
  julia> push!(tx_outs, TxOut(target_satoshis, script_pubkey));
  ```

3. And the change back to the same address.

  ```julia
  julia> change_address = b"moZ5AGrmGEFD4rCgSK2Vau46RjjsZpgmNo";
  julia> h160 = base58checkdecode(change_address)[2:end];
  julia> script_pubkey = Bitcoin.p2pkh_script(h160);
  julia> prev_amount = Bitcoin.txinvalue(tx_ins[1], true);
  julia> fee = 50000;
  julia> change_satoshis = prev_amount - target_satoshis - fee;
  julia> push!(tx_outs, TxOut(change_satoshis, script_pubkey));
  ```
> **Note**
> We are using our original address for change as a convenience. For more information on why this is not advised, please see the [Address_reuse](https://en.bitcoin.it/wiki/Address_reuse) from the bitcoin wiki.

4. Finally, we can construct our unsigned transaction with one input and two outputs.

  ```julia
  julia> tx_obj = Tx(1, tx_ins, tx_outs, 0, true)
  Transaction
  --------
  Testnet : true
  Version : 1
  Locktime : 0
  --------

  TxIn[
  bfd8209364e0fe275c30829391207d89fc1c480c6148caf37e5d612728f43247:0
  ]
  --------

  TxOut[

  OP_DUP
  OP_HASH160
  9f9a7abd600c0caa03983a77c8c3df8e062cb2fa
  OP_EQUALVERIFY
  OP_CHECKSIG
  amout (BTC) : 0.01,

  OP_DUP
  OP_HASH160
  582791ccb518faac5dd16290d7b65484ce416fa3
  OP_EQUALVERIFY
  OP_CHECKSIG
  amout (BTC) : 0.178785]
  ```

### Sign transaction

1. We now have our unsigned bitcoin transaction from which we can compute `z`, and sign using our GPG private key.
  ```
  julia> z = txsighash(tx_obj, 0)
  99621552382283238930643867389539606415724582999531180113553721867524305282175
  ```

2. Unfortunately OpenPGP signing algorithm implies [adding a trailer to `z` and hash that all together](https://tools.ietf.org/html/draft-ietf-openpgp-rfc4880bis-06#section-5.2.4). This will result in a totally different signature which prevents us from using a GnuPG signature at the moment. We will therefore export the private key from GnuPG and use it to sign the transaction with our Bitcoin package.

  ```shell
  $ gpg --export-secret-key --output privkey.bin 5E0BE9CCE55D5494495E0A0CB52EF617C8114CBC
  ```

3. We can then parse the resulting binary file as follows.

  ```julia
  julia> packet = bin2packet("privkey.bin")[1]
  Secret-Key Packet
   Length : 116, partial : false
   ----------------
    Version : 4, Time : 2019-02-13T17:37:37
   Algorithm : ECDSA public key algorithm [FIPS186] using scep256k1
   scep256k1 Point(𝑥,𝑦):
  f05314566c9bfc8d8cf463a7a01e7735245d588a60dd874f09a9636620abb314,
  6bda245d43cbbe019ab1ad74316d675dd858cdd776820969bcc21bbccbd3a661
   Specifics : Any[0x00, "Plaintext or unencrypted data", nothing, 103000258811017069236190011207690036914755247769939851615254124923965391038974]

  julia> secret = packet.body.specifics[4];

  julia> pk = PrivateKey(secret)
  PrivateKey(103000258811017069236190011207690036914755247769939851615254124923965391038974, scep256k1 Point(𝑥,𝑦):
  f05314566c9bfc8d8cf463a7a01e7735245d588a60dd874f09a9636620abb314,
  6bda245d43cbbe019ab1ad74316d675dd858cdd776820969bcc21bbccbd3a661)
  ```

4. Once in possession of the private key and `z` we can compute signature as follows, push it to the transaction which we can serialize and finally broadcast.

  ```julia
  julia> sig = pksign(pk, z)
  scep256k1 signature(𝑟, 𝑠):
  1413a5458e10a8d3419b9f534179a5367875ee390722b286612101ddbbdd1e4e,
  5d449bd818bafc5f25d0fcd17536b4554eb0245879585fe8fd24c13c906d6122

  julia> Bitcoin.txpushsignature(tx_obj, 0, z, sig, pubkey)
  true

  julia> bytes2hex(txserialize(tx_obj))
  "01000000014732f42827615d7ef3ca48610c481cfc897d20919382305c27fee0649320d8bf000000006b4830450221009ac61e75c35cbb282e98bd08b3206e3436570be357f886bf85e8964db3681f670220286590134b392f4e7cb03431a5aefc519c91cdbbb50e27681da43e47d74b73ae012103f05314566c9bfc8d8cf463a7a01e7735245d588a60dd874f09a9636620abb314ffffffff0240420f00000000001976a9149f9a7abd600c0caa03983a77c8c3df8e062cb2fa88ace9cd1001000000001976a914582791ccb518faac5dd16290d7b65484ce416fa388ac00000000"
  ```

5. See resulting transaction [1a...32](https://live.blockcypher.com/btc-testnet/tx/1a5b4504419857c369c753cb0b85068de39e55d4666cda57430c43fe1506f132/)

## Conclusion

We have sucessfully derived a bitcoin address from a GPG public key, created a raw transaction and signed it with its corresponding GPG private key. Unfortunately, we were not able to sign a bitcoin transaction directly with GPG due to its specific signing algorithm.
Nevertheless, there is still hope to make this work with an OpenPGP card which specifications confirm that the salting and hashing of the input data is not perform on card.


## Reference

- OpenPGP message format - [RFC4880bis](https://tools.ietf.org/html/draft-ietf-openpgp-rfc4880bis-06)
- OpenPGP card specification - [gnupg.org](https://gnupg.org/ftp/specs/OpenPGP-smart-card-application-3.3.pdf)
- `bin2packet` function - [PGPPacket.jl](https://gitlab.com/braneproject/pgpacket.jl)
- Bitcoin package - [Bitcoin.jl](https://gitlab.com/braneproject/Bitcoin.jl)
- Using your hardware wallet with Bitcoin Core - [Advancing Bitcoin conference](https://vimeo.com/316634495)

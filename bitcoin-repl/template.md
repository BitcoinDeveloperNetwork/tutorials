#  Building a Bitcoin REPL

## Introduction

In this tutorial, we will be building our own Read–eval–print loop (REPL) for the bitcoin wire protocol. REPL also termed an interactive toplevel or language shell, is a simple, interactive computer programming environment that takes single user inputs, evaluates them, and returns the result to the user; a program written in a REPL environment is executed piecewise.

## Background

The bitcoin core client currently comes bundles with a `bitcoin-cli` inteface. In our Bitcoin wire protocol 101, we demonstrated how you can communicate over the raw TCP bitcoin socket. In this tutorial we will be taking this a step further by implementing a command line tool which simplifies this process. Something I find very useful us talking to TCP services using either `telnet` or `netcat`. Testing an https server over clear test is a simple process.

```console
openssl s_client -connect www.google.com:443
CONNECTED(00000005)
depth=2 OU = GlobalSign Root CA - R2, O = GlobalSign, CN = GlobalSign
verify return:1
depth=1 C = US, O = Google Trust Services, CN = Google Internet Authority G3
verify return:1
depth=0 C = US, ST = California, L = Mountain View, O = Google LLC, CN = www.google.com
verify return:1
---
Certificate chain
 0 s:/C=US/ST=California/L=Mountain View/O=Google LLC/CN=www.google.com
   i:/C=US/O=Google Trust Services/CN=Google Internet Authority G3
 1 s:/C=US/O=Google Trust Services/CN=Google Internet Authority G3
   i:/OU=GlobalSign Root CA - R2/O=GlobalSign/CN=GlobalSign
---
Server certificate
-----BEGIN CERTIFICATE-----
MIIEgjCCA2qgAwIBAgIIbiOB3uuxA6owDQYJKoZIhvcNAQELBQAwVDELMAkGA1UE
BhMCVVMxHjAcBgNVBAoTFUdvb2dsZSBUcnVzdCBTZXJ2aWNlczElMCMGA1UEAxMc
R29vZ2xlIEludGVybmV0IEF1dGhvcml0eSBHMzAeFw0xOTAxMjkxNDU4MDBaFw0x
OTA0MjMxNDU4MDBaMGgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlh
MRYwFAYDVQQHDA1Nb3VudGFpbiBWaWV3MRMwEQYDVQQKDApHb29nbGUgTExDMRcw
FQYDVQQDDA53d3cuZ29vZ2xlLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC
AQoCggEBAMLteS7Kmg3gz8ww3nHL4o8QO1GZ8flbuonZsjG6R0gFrVtnXSpjp/FH
PLdUXLSmNFitdlqqsgnsNdgDxeIm4y/tqh/wfosyINZUgmtwrmvgqxD72AM/JUwd
9VpXe8VLMuA2u26cMYjJ0mYv/Q9xbj6GLKcFLCwLW+NyKosFXD5/UkMglP5LONlm
LpwguRCQslEWl1hyuxHDqzb07nUBGLgnqgTMiiRXHaPmY85YabNsqfu4xRVkUCsK
1xrLf9FmEh23esCNOewDQ4Ujg/pF4p7NxXogWJIUl6dG7IXjA864uf0dYWWr+y/M
5t6CHvy1Lu6Qtth7s3AwRaMYVPwU2XMCAwEAAaOCAUIwggE+MBMGA1UdJQQMMAoG
CCsGAQUFBwMBMBkGA1UdEQQSMBCCDnd3dy5nb29nbGUuY29tMGgGCCsGAQUFBwEB
BFwwWjAtBggrBgEFBQcwAoYhaHR0cDovL3BraS5nb29nL2dzcjIvR1RTR0lBRzMu
Y3J0MCkGCCsGAQUFBzABhh1odHRwOi8vb2NzcC5wa2kuZ29vZy9HVFNHSUFHMzAd
BgNVHQ4EFgQUJvhVx9GCXNGrvPRTXFPb+TeD15EwDAYDVR0TAQH/BAIwADAfBgNV
HSMEGDAWgBR3wrhQmmd2drEtwobQg6B+pn66SzAhBgNVHSAEGjAYMAwGCisGAQQB
1nkCBQMwCAYGZ4EMAQICMDEGA1UdHwQqMCgwJqAkoCKGIGh0dHA6Ly9jcmwucGtp
Lmdvb2cvR1RTR0lBRzMuY3JsMA0GCSqGSIb3DQEBCwUAA4IBAQAvEyDsvvrW3O5A
KvcIv8UypZ03KFZq4vknlPj8mWjKsFR6HRT7ZhWm0B5sfVxYNdxFVbBT8ZPBOHbh
rA2VQfcl0VhcQVZQPh1sWG6h0iYkNqxsVJe+pAhuppRz0zkz5ieoI8wiOG4NiPQO
IV5Zg/oJFHSFxM81yn02kAHPjwI9af/XX0mA5Id6YxFn2deP558DZll2ipo6XhKv
6B42ZxOqGBb+IlwNUKS02ClQIqkMvJmsfZYc2rVBqeyyo7qRBoqlQXQFgbJJBdW8
Xyc9zgDPWj5NauhmEZgRHx1u3z0hOSevcJprMCTxkpfPny7LMfgk/W/db63+9Wj4
ijSTkbBX
-----END CERTIFICATE-----
subject=/C=US/ST=California/L=Mountain View/O=Google LLC/CN=www.google.com
issuer=/C=US/O=Google Trust Services/CN=Google Internet Authority G3
---
No client certificate CA names sent
Server Temp Key: ECDH, X25519, 253 bits
---
SSL handshake has read 2945 bytes and written 285 bytes
---
New, TLSv1/SSLv3, Cipher is ECDHE-RSA-CHACHA20-POLY1305
Server public key is 2048 bit
Secure Renegotiation IS supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
SSL-Session:
    Protocol  : TLSv1.2
    Cipher    : ECDHE-RSA-CHACHA20-POLY1305
    Session-ID: 4BA26243AC140EE415BBE4FAA15F6D284272961626B158A3B42B62A8C122068C
    Session-ID-ctx:
    Master-Key: C8A33DBDB4A4E71AC0A9A337023115F27239C519C5E772530E768DE1A50250EDE24CF72C5A8A28E93C8858F20DCC6B5D
    TLS session ticket lifetime hint: 100800 (seconds)
    TLS session ticket:
    0000 - 00 7a 06 53 ad 36 6f 33-3d 67 8a a8 84 b1 4d 1a   .z.S.6o3=g....M.
    0010 - be ee cb 2e b9 ce a3 92-05 e1 1f 14 bb 1a 59 36   ..............Y6
    0020 - e2 be 48 81 c3 25 cb f8-dd 0e 30 df 3f 3b 2a 4e   ..H..%....0.?;*N
    0030 - 96 0b bf 3b 22 06 a5 6f-78 d5 a6 92 1c d9 bc 17   ...;"..ox.......
    0040 - 06 90 8e 58 be 02 32 cb-ee 3f 60 11 b8 f8 3a 3c   ...X..2..?`...:<
    0050 - f7 b6 c6 c1 19 16 0f cb-a0 4f 8c 4c 4c 14 f8 b6   .........O.LL...
    0060 - 04 5f b3 5b f8 71 11 0c-b5 a1 4b e0 33 1a d9 91   ._.[.q....K.3...
    0070 - 0a f8 2b 40 5f 58 a7 7b-36 c8 d4 2f b4 a2 54 a9   ..+@_X.{6../..T.
    0080 - 1c 0e e3 af 5c cd ac c3-80 83 54 29 e2 54 c0 4c   ....\.....T).T.L
    0090 - 44 21 4b 18 6a 0d 6d c4-c0 3b ff 20 66 f6 d6 65   D!K.j.m..;. f..e
    00a0 - 98 7f 9d d0 28 d3 64 e3-03 f8 f4 f0 a9 b8 e9 11   ....(.d.........
    00b0 - 1f f4 bc 07 1c 63 85 55-29 ef 08 29 67 3b 3f f6   .....c.U)..)g;?.
    00c0 - a3 e7 64 83 17 9a d5 5b-40 ab bf db 71 e8 ab 07   ..d....[@...q...
    00d0 - 76 a2 22 13 c1                                    v."..

    Start Time: 1550091811
    Timeout   : 7200 (sec)
    Verify return code: 0 (ok)
---
HEAD / HTTP/1.0

HTTP/1.0 200 OK
Date: Wed, 13 Feb 2019 21:03:38 GMT
Expires: -1
Cache-Control: private, max-age=0
Content-Type: text/html; charset=ISO-8859-1
P3P: CP="This is not a P3P policy! See g.co/p3phelp for more info."
Server: gws
X-XSS-Protection: 1; mode=block
X-Frame-Options: SAMEORIGIN
Set-Cookie: 1P_JAR=2019-02-13-21; expires=Fri, 15-Mar-2019 21:03:38 GMT; path=/; domain=.google.com
Set-Cookie: NID=158=cMAXEob6QDb1bqGJKaiTIU2ooum4kslNKlR19d9uM8qtae7qVu0xmNRI-dDPjJYZDZ7Qn3iIuR6GGOk7b81aznuK391lVBIGvL3RcHMNWgHZnyjTrqM4TWHJuSXemXHui4r9WsRmvKUubIoYmD_6QBPt8hRQFqKsyQu6hfJ9F_I; expires=Thu, 15-Aug-2019 21:03:38 GMT; path=/; domain=.google.com; HttpOnly
Alt-Svc: quic=":443"; ma=2592000; v="44,43,39"
Accept-Ranges: none
Vary: Accept-Encoding

read:errno=0
```

Unfortunately, there is no equivalent for talking to the bitcoin protocol.

## Let's get started

```console
gr0kchain $ cli.js localhost 18444
Connecting to  localhost 18444
Sending version

Received : 
/Satoshi:0.12.1/
```

Or

```console
gr0kchain $ cli.js
bitcoin> connect localhost 18444
Connecting to  localhost 18444
bitcoin> version
/Satoshi:0.12.1/
bitcoin> 
```


## Conclusion

In this tutorial, we walked through the various step of building our very own bitcoin command line REPL. 


## Reference

[GitHub](https://github.com/BitcoinDeveloperNetwork/bitcoin-repl)


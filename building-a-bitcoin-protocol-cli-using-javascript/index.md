## Introduction

In this tutorial, we will be building our very own command line interface for the bitcoin wire protocol which can be used for simple debugging or educational purposes.

## Background

The bitcoin core client currently comes bundled with a Remote Procedure Call (RPC) client tool called `bitcoin-cli`. In our [Bitcoin wire protocol 101](/bitcoin-wire-protocol/) however, we demonstrated how you can communicate over the raw TCP bitcoin socket by using existing command line based tools.

In this tutorial we will be taking this a step further by implementing our own command line tool which simplifies this process. Something I find very useful is talking to TCP services using either `telnet` or `netcat`. Testing an http server over clear text is a simple process.

Here is a simple command for connecting to an http server over port 80 and issuing an HTTP `HEAD` request.

```console
gr0kchain $ telnet bitcoindev.network 80
Trying 188.166.140.217...
Connected to bitcoindev.network.
Escape character is '^]'.
HEAD / HTTP/1.0

HTTP/1.1 200 OK
Server: nginx/1.10.3 (Ubuntu)
Date: Wed, 13 Feb 2019 21:05:32 GMT
Content-Type: text/html
Content-Length: 612
Last-Modified: Thu, 17 Nov 2016 06:55:25 GMT
Connection: close
Vary: Accept-Encoding
ETag: "582d545d-264"
Accept-Ranges: bytes

Connection closed by foreign host.
```

Sometimes, we'd like to do this over https, so here is the same example of connecting to BDN over tls.

```console
gr0kchain $ openssl s_client -connect bitcoindev.network:443
CONNECTED(00000005)
depth=2 O = Digital Signature Trust Co., CN = DST Root CA X3
verify return:1
depth=1 C = US, O = Let's Encrypt, CN = Let's Encrypt Authority X3
verify return:1
depth=0 CN = bitcoindev.network
verify return:1
---
Certificate chain
 0 s:/CN=bitcoindev.network
   i:/C=US/O=Let's Encrypt/CN=Let's Encrypt Authority X3
 1 s:/C=US/O=Let's Encrypt/CN=Let's Encrypt Authority X3
   i:/O=Digital Signature Trust Co./CN=DST Root CA X3
---
Server certificate
-----BEGIN CERTIFICATE-----
MIIFXDCCBESgAwIBAgISA28a8aBf1CaFdN/tdYRwzcJcMA0GCSqGSIb3DQEBCwUA
MEoxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MSMwIQYDVQQD
ExpMZXQncyBFbmNyeXB0IEF1dGhvcml0eSBYMzAeFw0xOTAxMzExMDUzMjlaFw0x
OTA1MDExMDUzMjlaMB0xGzAZBgNVBAMTEmJpdGNvaW5kZXYubmV0d29yazCCASIw
DQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALg15FXF9DuS/xVudFOuBzgMn1Os
aOPZNFfa1MEcu3pj6DMjrLQaOmJY4JKdFUomqI63YZBtg3Sq850xhdiXWzvxI35V
waGfHNaksqaMkv7eRTwbrTdr5QafVF75Qg/DaRiimRAa2W4eczaRVM42skaIAVQ7
GLez3+UE4d7Bu4g/qqKDn8z3Zca0oGyqcSSjRpLKKnaD3VoqfVWLFklskxZCCTmu
d/YDPN4+9+i70jcJCEmtglssACIUyYmT7fI+l0dyXxSeY04v6EYPjQw8vsef6R6/
D6fNsctomeE00kT6sY6sn46VJ4QlNtPBkQsanpzF49CujWUdkzll1S43disCAwEA
AaOCAmcwggJjMA4GA1UdDwEB/wQEAwIFoDAdBgNVHSUEFjAUBggrBgEFBQcDAQYI
KwYBBQUHAwIwDAYDVR0TAQH/BAIwADAdBgNVHQ4EFgQUizxQYU1OXnHocpcV6rAx
U0er5VMwHwYDVR0jBBgwFoAUqEpqYwR93brm0Tm3pkVl7/Oo7KEwbwYIKwYBBQUH
AQEEYzBhMC4GCCsGAQUFBzABhiJodHRwOi8vb2NzcC5pbnQteDMubGV0c2VuY3J5
cHQub3JnMC8GCCsGAQUFBzAChiNodHRwOi8vY2VydC5pbnQteDMubGV0c2VuY3J5
cHQub3JnLzAdBgNVHREEFjAUghJiaXRjb2luZGV2Lm5ldHdvcmswTAYDVR0gBEUw
QzAIBgZngQwBAgEwNwYLKwYBBAGC3xMBAQEwKDAmBggrBgEFBQcCARYaaHR0cDov
L2Nwcy5sZXRzZW5jcnlwdC5vcmcwggEEBgorBgEEAdZ5AgQCBIH1BIHyAPAAdgBj
8tvN6DvMLM8LcoQnV2szpI1hd4+9daY4scdoVEvYjQAAAWijwbwfAAAEAwBHMEUC
IQCnMyEFipV9Ck8ls0ENu3QA9bLECBgz7m77g8wmEKVGRQIgEAlK8TNuP9sLUkzb
n9kNQZjeAxHgB+42IEkcgOWH4SIAdgDiaUuuJujpQAnohhu2O4PUPuf+dIj7pI8o
kwGd3fHb/gAAAWijwb4SAAAEAwBHMEUCIGN4jj8CAinetQfkcqFcuE+dle4P6rkK
x6/WxBtlWNhSAiEA0conDFr7IhiQGZsdy9ZvnmHRqVbR1yodFkS9jxQl/MowDQYJ
KoZIhvcNAQELBQADggEBACrN3uex8CDSGrEpTgMp3R6PhHcBZ9tjPtlQ1nA9dW5X
y7x1PzYBnEGIrvUVcS/FnHzQBFtTMYG5CQJwW5zNX8cpt4dpKdNeSU+mdCqTOTOS
MVLi55xaDK2sznooErhTxZRMozRRoQsIfEuzplyArNRYPcJ0hJGzQqUj2kFUUVVe
0qxs4OR5YM+Q/sRkcZiz3eYyd2usZwvu34mAsw9Z+0KA0WB9+acIgarrIuXFmRdh
oiz+c9JpXcVvAebF/p25ZK5ztwRogqScjhljD++vi0S3wHzUefNF7VNCthB0PNgz
KOciSeUy1J3+6rUCgwfTw6WXLp6n7KNlNDsMC+NhiOw=
-----END CERTIFICATE-----
subject=/CN=bitcoindev.network
issuer=/C=US/O=Let's Encrypt/CN=Let's Encrypt Authority X3
---
No client certificate CA names sent
Server Temp Key: ECDH, P-384, 384 bits
---
SSL handshake has read 3092 bytes and written 358 bytes
---
New, TLSv1/SSLv3, Cipher is ECDHE-RSA-AES128-GCM-SHA256
Server public key is 2048 bit
Secure Renegotiation IS supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
SSL-Session:
    Protocol  : TLSv1.2
    Cipher    : ECDHE-RSA-AES128-GCM-SHA256
    Session-ID: A12450F8C3C88976300F424F70D3665BF6B9357FA54690C10E0AB3527E6DF972
    Session-ID-ctx:
    Master-Key: 2D49E0C4692EA9E5ED935BD571F0ABFB9E244855EA842883446625437E8A38193035B380EEF4252779FA0F3433EB2B84
    Start Time: 1550122228
    Timeout   : 7200 (sec)
    Verify return code: 0 (ok)
---
HEAD  HTTP/1.0
HTTP/1.1 400 Bad Request
Server: nginx/1.10.3 (Ubuntu)
Date: Thu, 14 Feb 2019 05:30:34 GMT
Content-Type: text/html
Content-Length: 182
Connection: close

read:errno=0
```

Unfortunately, none of these tools work out of the box due to the bitcoin wire protocol being binary and not clear text. If you know of one, please feel free to leave it in the comments. Either way, we will be writing our own so we can learn more about how this works in detail.


## Before we begin

So, let's firstly have a look at what we could expect from having a tool which helps us test a connection to a remote node and printing out its version number to screen.

```console
gr0kchain $ bitcoinwire-cli localhost 18444
Connecting to  localhost 18444
Sending version

/Satoshi:0.17.1/
```

Think of it as the telnet for bitcoin!

## Getting started

For this tutorial we will be using javascript as our preferred language, so an existing nodejs environment would be required.

We'll start off by creating our project and initialising it as a node package.

```console
gr0kchain $ mkdir ./bitcoinwire-cli/
gr0kchain $ cd ./bitcoinwire-cli/
gr0kchain $ npm init
```

Follow the prompts required for setting up your package.

### The connection

Our first challenge will be to establish and test the connectivity to a bitcoin node. For this we will make use of the [net](https://nodejs.org/api/net.html) package provided by nodejs. Open up your favourite text editor, and create an `index.js` file containing the follow:

```console
var net = require('net');

var client = new net.Socket();

var host = process.argv[2];
var port = process.argv[3];

client.on('data', function(data) {
  console.log('Received: ' + data);
  client.destroy();
});

client.connect(port, host, function() {
});

client.on('connect', function() {
  console.log('Connection opened');
});

client.on('close', function() {
  console.log('Connection closed');
});
```

We can test this against any TCP based socket server to see if we can connect by simply passing `host` and `port number` arguments to our script.

```console
gr0kchain $ node ./index.js bitcoindev.network 80
Connection opened
Connection closed
```

Here we have successfully checked port 80 against the `bitcoindev.network` web server! For failed attempts, we should receive something like this.

```console
node ./index.js bitcoindev.network 81
events.js:183
      throw er; // Unhandled 'error' event
      ^

Error: connect ECONNREFUSED 188.166.140.217:81
    at Object._errnoException (util.js:992:11)
    at _exceptionWithHostPort (util.js:1014:20)
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1186:14)
```

That's nasty, so let's add some error handling which gives us a friendlier message by updating our `connect` call.

```console
client.on('error', function(ex) {
  console.log("There was a problem trying to connect to" , ex.address, ex.port)
});
```

Running this now should print out the following on failed connection attempts.

```console
gr0kchain $ node ./index.js bitcoindev.network 81
There was a problem trying to connect to 188.166.140.217 81
Connection closed
```

> Note: There a are many useful packages which help in creating complex cli tools including [prompt](https://www.npmjs.com/package/prompt), [commander](https://www.npmjs.com/package/commander) and [yargs](https://www.npmjs.com/package/yargs). We have omitted these for the sake of simplicity, but feel free to explore these yourself.

### The conversation

Now that we've been able to successfully test a remote connection, let's test this against our bitcoin server. You can either test this against your own server, or by selecting a node as explained in our previous tutorial on [Bitcoin Network statistics](/bitcoin-network-statistics/).

As previously demonstrated in that tutorial, here is a snippet from our latest `dnsseed.dump` file.

```console
# address                                        good  lastSuccess    %(2h)   %(8h)   %(1d)   %(7d)  %(30d)  blocks      svcs  version
47.75.208.26:8333                                   1   1550125076  100.00% 100.00% 100.00% 100.00%  99.30%  562974  0000040d  70015 "/Satoshi:0.13.2/"
213.133.103.3:9199                                  0   1550125035  100.00% 100.00% 100.00% 100.00%  99.30%  562974  0000000d  70015 "/Satoshi:0.13.2/"
172.99.120.113:8333                                 1   1550125063  100.00% 100.00% 100.00% 100.00%  99.30%  562974  0000040d  70015 "/Satoshi:0.17.0.1/"
```

It is not recommended that you execute commands against these nodes unless it is either your own, or you have informed the owner of that node that you will be conducting these tests. The protocol will however ban you if you start flooding it with spam or invalid messages. For the purposes of our tutorial, we will be poking at a local `regtest` instance.

> Note: We have provided a simple docker container configured in regtest mode that you can install for testing purposes.
>
> ```console
> gr0kchain:~ $ docker volume create --name=bitcoind-data
> gr0kchain:~ $ docker run -v bitcoind-data:/bitcoin --name=bitcoind-node -d \
>      -p 18444:18444 \
>      -p 127.0.0.1:18332:18332 \
>      bitcoindevelopernetwork/bitcoind-regtest
> ```

```console
gr0kchain $ node ./index.js 127.0.0.1 18444
Connection opened
Connection closed
gr0kchain $
```

Great success!

Now that we've tested for connectivity, let's get into some more interesting things.

> Note: Etiquette
> Remember, from our Bitcoin wire protocol 101 tutorial. When a node creates an outgoing connection, it will immediately advertise its version. The remote node will respond with its version. No further communication is possible until both peers have exchanged their version.

To establish a conversation with our remote node, we'll need to first announce ourselves. We can do this by updating our connection function as follows. We are currently using  

```console
client.on('connect', function() {
  console.log('Connection opened');
  var buff = Buffer.from('fabfb5da76657273696f6e000000000064000000358d493262ea0000010000000000000011b2d05000000000010000000000000000000000000000000000ffff000000000000000000000000000000000000000000000000ffff0000000000003b2eb35d8ce617650f2f5361746f7368693a302e372e322fc03e0300','hex');
  client.write(buff);
});
```

Here we are converting our hex encoded based message to a buffer called `buff`. We then proceed in pushing this over the connection we have opened by using the `write` method from our `client`.

So let's try this out!

```console
gr0kchain $ node ./index.js 127.0.0.1 18444
Connection opened
�eceived: ����versionf�Ks�
�E�WĖ/Satoshi:0.12.1/����verack]�������pin�~�ܼ��SKB����getheaders�6�Nb�M������bulԚ��S0͖�S2��<��к:�
                                                                                                A$v��;�JƄI��`�1X�zZU��_�����^���
=M\�s�a"��6�!�.7z�N�h
cW����               v)Y�W�}4yҲ�*\�f�
      #���1��Ns1
                � �����i���l�j��r=��T`�?�f!GQEҧ��]�|O��,��]y0��"G�@��԰<b�	�1}0��	LV�"@D̢�d�B�8g�k\8�!˗�_�f��X��KT�a�T/A�x��-�5��>��<�
                                                                                                                                            �
                                                                                                                                             ��o5����L��X�?Y�� e���Ǩ֨7�;�+��b"�<��.����OC�#�p�?��$L�"�3�E��W�=�`�����+&Fx�(s���
]]AZ8��LM��jbXk�Z��$���|!<ޝ���@U��Q�n���l �Su)���λcʓ*C����~a����QZ�6�̮ąɼ��2�F[��T�� �KI�7W�U�N�s���
                                                                                                    5�6/%��9>x�~m��O/i���WZ�)�l��(�a�̚>n߮}%/A�&I�b	p�
                                                                                                                                                          90p����h���� �|�Y%2�����{n�ˮ��lo�
��r���F�c�O��e��h�
Connection closed
```

Nice! If we receive some response as demonstrated in the above example, we should be in good shape. If not, there might be something wrong with the message you are sending, or it could be that the service running on that port is not a bitcoin node! This should however be unlikely assuming you are confident that the `host` and `port` are in fact correct.

> Note: You can always look at the debug.log file of your node to see if it is receiving incoming requests. Ensure that you have updated your `bitcoin.conf` file to set `debug=1`.
> ```console
> 2019-02-14 12:18:16 Added connection to 127.0.0.1:63008 peer=12
> 2019-02-14 12:18:16 connection from 127.0.0.1:63008 accepted
> 2019-02-14 12:18:16 received: version (100 bytes) peer=12
> ```

Next up, we'll need to sanitise the response received from the targeted node. You might notice some strings including `version`, `/Satoshi:0.12.1/` or even `verack`. This is because these are ascii bytes wrapped in our general bitcoin messaging protocol data.

We can decode this by first converting our response to a buffer as follows.

```console
client.on('data', function(data) {
  var buf = Buffer.from(data,'hex');
  console.log(buf.toString('hex'))
  client.destroy();
});
```

Once updated, we should receive something similar to the following when rerunning our script.

```console
gr0kchain $ node ./index.js 127.0.0.1 18444
Connection opened
fabfb5da76657273696f6e0000000000660000007f968e697c1101000500000000000000395d655c00000000010000000000000000000000000000000000ffff000000000000050000000000000000000000000000000000ffff00000000480cd123687d71d71e22102f5361746f7368693a302e31322e312f6500000001
Connection closed
```

Let's see what this looks like in a more legible format.

```console
echo "fabfb5da76657273696f6e0000000000660000007f968e697c1101000500000000000000395d655c00000000010000000000000000000000000000000000ffff000000000000050000000000000000000000000000000000ffff00000000480cd123687d71d71e22102f5361746f7368693a302e31322e312f6500000001" | xxd -r -p | xxdecho "fabfb5da76657273696f6e0000000000660000007f968e697c1101000500000000000000395d655c00000000010000000000000000000000000000000000ffff000000000000050000000000000000000000000000000000ffff00000000480cd123687d71d71e22102f5361746f7368693a302e31322e312f6500000001" | xxd -r -p | xxd
00000000: fabf b5da 7665 7273 696f 6e00 0000 0000  ....version.....
00000010: 6600 0000 7f96 8e69 7c11 0100 0500 0000  f......i|.......
00000020: 0000 0000 395d 655c 0000 0000 0100 0000  ....9]e\........
00000030: 0000 0000 0000 0000 0000 0000 0000 ffff  ................
00000040: 0000 0000 0000 0500 0000 0000 0000 0000  ................
00000050: 0000 0000 0000 0000 ffff 0000 0000 480c  ..............H.
00000060: d123 687d 71d7 1e22 102f 5361 746f 7368  .#h}q.."./Satosh
00000070: 693a 302e 3132 2e31 2f65 0000 0001       i:0.12.1/e....
```

Here we can see the structure of our message packet. Here is a quick reference again for our `message` and `version` data structures.

### Bitcoin Message

<table>
<tbody><tr>
<th> Field Size </th>
<th> Description </th>
<th> Data type </th>
<th> Comments
</th></tr>
<tr>
<td> 4 </td>
<td> magic </td>
<td> uint32_t </td>
<td> Magic value indicating message origin network, and used to seek to next message when stream state is unknown
</td></tr>
<tr>
<td> 12 </td>
<td> command </td>
<td> char[12] </td>
<td> ASCII string identifying the packet content, NULL padded (non-NULL padding results in packet rejected)
</td></tr>
<tr>
<td> 4 </td>
<td> length </td>
<td> uint32_t </td>
<td> Length of payload in number of bytes
</td></tr>
<tr>
<td> 4 </td>
<td> checksum </td>
<td> uint32_t </td>
<td> First 4 bytes of sha256(sha256(payload))
</td></tr>
<tr>
<td>&nbsp;? </td>
<td> payload </td>
<td> uchar[] </td>
<td> The actual data
</td></tr></tbody></table>


### Bitcoin Version message

<table>
<tbody><tr>
<th> Field Size </th>
<th> Description </th>
<th> Data type </th>
<th> Comments
</th></tr>
<tr>
<td> 4 </td>
<td> version </td>
<td> int32_t </td>
<td> Identifies protocol version being used by the node
</td></tr>
<tr>
<td> 8 </td>
<td> services </td>
<td> uint64_t </td>
<td> bitfield of features to be enabled for this connection
</td></tr>
<tr>
<td> 8 </td>
<td> timestamp </td>
<td> int64_t </td>
<td> standard UNIX timestamp in seconds
</td></tr>
<tr>
<td> 26 </td>
<td> addr_recv </td>
<td> <a href="#Network_address">net_addr</a> </td>
<td> The network address of the node receiving this message
</td></tr>
<tr>
<td colspan="4"> Fields below require version ≥ 106
</td></tr>
<tr>
<td> 26 </td>
<td> addr_from </td>
<td> <a href="#Network_address">net_addr</a> </td>
<td> The network address of the node emitting this message
</td></tr>
<tr>
<td> 8 </td>
<td> nonce </td>
<td> uint64_t </td>
<td> Node random nonce, randomly generated every time a version packet is sent. This nonce is used to detect connections to self.
</td></tr>
<tr>
<td>&nbsp;? </td>
<td> user_agent </td>
<td> <a href="#Variable_length_string">var_str</a> </td>
<td> <a rel="nofollow" class="external text" href="https://github.com/bitcoin/bips/blob/master/bip-0014.mediawiki">User Agent</a> (0x00 if string is 0 bytes long)
</td></tr>
<tr>
<td> 4 </td>
<td> start_height </td>
<td> int32_t </td>
<td> The last block received by the emitting node
</td></tr>
<tr>
<td colspan="4"> Fields below require version ≥ 70001
</td></tr>
<tr>
<td> 1 </td>
<td> relay </td>
<td> bool </td>
<td> Whether the remote peer should announce relayed transactions or not, see <a rel="nofollow" class="external text" href="https://github.com/bitcoin/bips/blob/master/bip-0037.mediawiki">BIP 0037</a>
</td></tr></tbody></table>

So let's include some code which will help us decode this. We can define json objects for the schemas of both our `message` and `payload` data structures.

> Note: Considering something like protobuf might be more convenient here, we are however doing our own schemas for the sake of simplicity.

```console
var message = {
  magic : 0,
  command :  4,
  length : 16,
  checksum : 20,
  payload :24
}

var version = {
    version : 0,
    services: 4,
    timestamp: 12,
    addr_recv: 20,
    addr_from: 46,
    nonce: 72,
    user_agent: {s: 80}
}
```

We also need a function which can decode our payload based on our schemas.

```console
function decodePacket(payload, schema) {
  return Object.keys(schema).map(function(v, k, data) {
    if (Object.keys(schema)[k+1] in schema && typeof schema[Object.keys(schema)[k]] != 'object') {
        return payload.slice(schema[v], schema[Object.keys(schema)[k+1]])
    } else if (typeof schema[Object.keys(schema)[k]] == 'object') {
      var len = payload.slice(schema[v].s, schema[v].s + 1 ).readInt8()
      return payload.slice(schema[v].s + 1, schema[v].s + len + 1);
    } else {
      return payload.slice(schema[v], payload.length);
    }
  })
}
```

We can now utilise these in the data handler when we receive incoming messages from the remote node by updating our `data` event handler as follows.

```console
client.on('data', function(data) {
  var buf = Buffer.from(data,'hex');
  var packet = decodeMessage(buf, message);
  var payload = decodeMessage(packet[4], version);

  var clientVersion = payload[0].readUInt32LE()
  var userAgent = payload[6].toString()

  console.log(clientVersion, userAgent)

  client.destroy();
})
```

Finally, we should have a file that looks similar to this.

```console
var net = require('net');

var client = new net.Socket();

var host = process.argv[2];
var port = process.argv[3];


var message = {
  magic : 0,
  command :  4,
  length : 16,
  checksum : 20,
  payload :24
}

var version = {
    version : 0,
    services: 4,
    timestamp: 12,
    addr_recv: 20,
    addr_from: 46,
    nonce: 72,
    user_agent: {s: 80}
}

function decodeMessage(payload, schema) {
  return Object.keys(schema).map(function(v, k, data) {
    if (Object.keys(schema)[k+1] in schema && typeof schema[Object.keys(schema)[k]] != 'object') {
        return payload.slice(schema[v], schema[Object.keys(schema)[k+1]])
    } else if (typeof schema[Object.keys(schema)[k]] == 'object') {
      var len = payload.slice(schema[v].s, schema[v].s + 1 ).readInt8()
      return payload.slice(schema[v].s + 1, schema[v].s + len + 1);
    } else {
      return payload.slice(schema[v], payload.length);
    }
  })
}

client.on('data', function(data) {
  var buf = Buffer.from(data,'hex');
  var packet = decodeMessage(buf, message);
  var payload = decodeMessage(packet[4], version);

  var clientVersion = payload[0].readUInt32LE()
  var userAgent = payload[6].toString()

  console.log(clientVersion, userAgent)

  client.destroy();
});

client.connect(port, host, function() {
});

client.on('error', function(ex) {
  console.log("There was a problem trying to connect to" , ex.address, ex.port)
});

client.on('connect', function() {
  console.log('Connection opened');
  var buff = Buffer.from('fabfb5da76657273696f6e000000000064000000358d493262ea0000010000000000000011b2d05000000000010000000000000000000000000000000000ffff000000000000000000000000000000000000000000000000ffff0000000000003b2eb35d8ce617650f2f5361746f7368693a302e372e322fc03e0300','hex');
  client.write(buff);
});

client.on('close', function() {
  console.log('Connection closed');
});
```

We can then proceed to test it as follows.

```console
gr0kchain $ node ./index.js localhost 18444
Connection opened
70012 '/Satoshi:0.12.1/'
Connection closed
gr0kchain $
```

Amazing work!

## Conclusion

In this tutorial, we walked through the various steps for building our very own bitcoin command line interface! You might wish to extend this with some of the other message types, but this should get you started!

## Reference

[Bitcoin protocol documentation](https://en.bitcoin.it/wiki/Protocol_documentation)
[GitHub](https://github.com/BitcoinDeveloperNetwork/bitcoin-repl)

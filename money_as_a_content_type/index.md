# Money as a content type

## Introduction

In this tutorial, we will be exploring some ideas around thinking of money as a content type. Everyone appears to have hijacked Tim Berners-Lee, father of the webs take on what [Web 3.0](https://en.wikipedia.org/wiki/Semantic_Web#Web_3.0) really meant, but perhaps, web 3.0 as he puts it, was just the semantic web.

That being said, we hardly incremented this pseudo term every time a new content type was added to the web specifications. Can you imagine if we had done that for text, images, sound or even video, so why start now? After all, Bitcoin has given us something more significant, something which complements the web, something that is native to it, an additional content type called money!


## Background

This tutorial is inspired by a talk given on [Money As A Content Type](https://www.youtube.com/watch?v=6vFgBGdmDgs) by [Andreas Antonopolous](https://twitter.com/aantonop). Since watching this talk the first time, I've been exploring various ways in which this level of thinking could be applied to the web we know and love today.

![](assets/tx.png)

And yes, the image above is an example of a bitcoin transaction which has been encoded using [steganography](https://en.wikipedia.org/wiki/Steganography).

> **Note** This is not the most efficient way of encoding transaction data into a file. But you can imagine using this technique as an example for any other kind of data we have

You can confirm this for yourself by uploading it to the following [site](https://www.peter-eigenschink.at/projects/steganographyjs/showcase) and selecting the `Read` option.

![](assets/steganography_preview.png)

And decoding it on the console using the bitcoin explorer (`bx`) command. Please checkout our [Primer for libbitcoin](/a-primer-for-libbitcoin) for more information. 

```console
gr0kchain@bitcoindev $ echo 0100000001c997a5e56e104102fa209c6a852dd90660a20b2d9c352423edce25857fcd3704000000004847304402204e45e16932b8af514961a1d3a1a25fdf3f4f7732e9d624c6c61548ab5fb8cd410220181522ec8eca07de4860a4acdd12909d831cc56cbbac4622082221a8768d1d0901ffffffff0200ca9a3b00000000434104ae1a62fe09c5f51b13905f07f06b99a2f7159b2225f374cd378d71302fa28414e7aab37397f554a7df5f142c21c1b7303b8a0626f1baded5c72a704f7e6cd84cac00286bee0000000043410411db93e1dcdb8a016b49840f8c53bc1eb68a382e97b1482ecad7b148a6909a5cb2e0eaddfb84ccf9744464f82e160bfa9b8b64f9d4c03f999b8643f656b412a3ac00000000 | bx tx-decode
transaction
{
    hash f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16
    inputs
    {
        input
        {
            previous_output
            {
                hash 0437cd7f8525ceed2324359c2d0ba26006d92d856a9c20fa0241106ee5a597c9
                index 0
            }
            script [304402204e45e16932b8af514961a1d3a1a25fdf3f4f7732e9d624c6c61548ab5fb8cd410220181522ec8eca07de4860a4acdd12909d831cc56cbbac4622082221a8768d1d0901]
            sequence 4294967295
        }
    }
    lock_time 0
    outputs
    {
        output
        {
            address_hash fc916f213a3d7f1369313d5fa30f6168f9446a2d
            script "[04ae1a62fe09c5f51b13905f07f06b99a2f7159b2225f374cd378d71302fa28414e7aab37397f554a7df5f142c21c1b7303b8a0626f1baded5c72a704f7e6cd84c] checksig"
            value 1000000000
        }
        output
        {
            address_hash 11b366edfc0a8b66feebae5c2e25a7b6a5d1cf31
            script "[0411db93e1dcdb8a016b49840f8c53bc1eb68a382e97b1482ecad7b148a6909a5cb2e0eaddfb84ccf9744464f82e160bfa9b8b64f9d4c03f999b8643f656b412a3] checksig"
            value 4000000000
        }
    }
    version 1
}
```

## The Web vs the Internet

Andreas is also well known for having referred to bitcoin as the [internet of value](https://www.youtube.com/watch?v=rc744Z9IjhY), where he refers to `Money` as and application.

Before we dive into things, let's first review the definitions of what we mean when referring to the internet vs the world wide web.

**Internet**
>
> /ˈɪntənɛt/
> noun
> a global computer network providing a variety of information and communication facilities, consisting of interconnected networks using standardized communication protocols.

**World Wide Web**
> noun
> an information system on the Internet which allows documents to be connected to other documents by hypertext links, enabling the user to search for information by moving from one document to another.


## Let's get started

So let's explore what it means to think of money as a content type on the web.

Some primitives we have in bitcoin include Transactions, Blocks and Addresses, which might suggest that the following extensions of the HTTP protocol be considered.

`Content-Type: transaction/bitcoin`
`Content-Type: block/bitcoin`
`Content-Type: address/bitcoin`

So let's see how this might work.

### Building an HTTP server

For the sake of simplicity, we'll be using `javascript` and `nodejs` to demonstrate some of the concepts.


We'll first install [express](https://expressjs.com/) for building an extensible http server, and a useful helper called [nodemon](https://www.npmjs.com/package/nodemon) which eases the development by reloading our code as we make changes.

```console
gr0kchain@bitcoindev $ npm install express
gr0kchain@bitcoindev $ npm install -g nodemon
```

After you've installed these, create a file called `index.js` and add the following lines of code.

```
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello Bitcoin!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
```

We test that everything is working as follows. First start our HTTP server.

```console
gr0kchain@bitcoindev $ nodemon ./index.js
```

Then, in a separate terminal, test your server by issuing a request.

```console
gr0kchain@bitcoindev $ curl http://localhost:8080
Hello Bitcoin!
```

![](assets/success.jpg)

### Adding our custom content types

The HTTP 1.1 specification includes information on our common methods including `GET` and `POST`, and the less common ones, `PUT`, `DELETE`, `CONNECTION`, `OPTION` and `TRACE`. It also includes information on the HTTP [Content-Type](https://tools.ietf.org/html/rfc7231#section-3.1.1.5) request and response headers.

> The "Content-Type" header field indicates the media type of the associated representation: either the representation enclosed in the message payload or the selected representation, as determined by the message semantics.  The indicated media type defines both the data format and how that data is intended to be processed by a recipient, within the scope of the received message semantics, after any content codings indicated by Content-Encoding are decoded.

Let's look at adding an address `content-type` to our server. To keep things simple, we'll be interfacing with a Bitcoin Core node via its [remote procedure call (RPC)](https://en.bitcoin.it/wiki/Original_Bitcoin_client/API_calls_list) interface using a node package called [bitcoind-rpc](https://www.npmjs.com/package/bitcoind-rpc).

1. Install `bitcoin-rpc`.

  ```console
  gr0kchain@bitcoindev $ npm install bitcoind-rpc
```

2. Add `bitcoind-rpc` to your `index.js` file.

  ```console
  const RpcClient = require('bitcoind-rpc');

  var config = {
      protocol: 'http',
      user: 'bitcoin',
      pass: 'local321',
      host: '127.0.0.1',
      port: '18332',
  };

  var rpc = new RpcClient(config);
  ```

  > **Note** There a are many ways in which you could achieve integration with bitcoin, some interesting libraries include [bitcoinjs-lib](), [bcoin](), [bitcore]() to name just a few.

3. Add an HTTP end-point for working with addresses.

  ```console
  app.get('/address', (req, res) => {
    rpc.getNewAddress(function(err, resp) {
      res.send(resp);
    })
  });
  ```
4. Test that our new method works.
  ```console
  gr0kchain@bitcoindev $ curl http://localhost:8080/address
  {"result":"mx1R8iZjekd2EmqUktPUpbAGeED1mf78R1","error":null,"id":45307}
  ```

  Awesome stuff bitcoiner, now let's convert this into a content type.

5. Update your `address` end-point to include the `bitcoin/address` content type response header.

  ```console
  gr0kchain@bitcoindev $ curl -v http://127.0.0.1:8080/address
  *   Trying 127.0.0.1...
  * TCP_NODELAY set
  * Connected to 127.0.0.1 (127.0.0.1) port 8080 (#0)
  > GET /address HTTP/1.1
  > Host: 127.0.0.1:8080
  > User-Agent: curl/7.54.0
  > Accept: */*
  >
  < HTTP/1.1 200 OK
  < X-Powered-By: Express
  < Content-Type: address/bitcoin; charset=utf-8
  < Content-Length: 71
  < ETag: W/"47-ItepdBa7ZtjUhF+M8YYAfYua7dM"
  < Date: Mon, 25 Feb 2019 09:48:40 GMT
  < Connection: keep-alive
  <
  * Connection #0 to host 127.0.0.1 left intact
  {"result":"mkCrmL6tCTDgExPXUkwQsYVRjEvC1Susfb","error":null,"id":77908}
  ```

### Interacting with Bitcoin content types

Now that we've setup a bitcoin content type for `address`, let's see how we can consume this from our http client.

1. Create a file called `static/index.html`
  ```console
  <!doctype html>
  <html>
    <head>
      <title>Bitcoin Markup</title>
    </head>
    <body>
    </body>
  </html>
  ```
2. Install [axios](https://www.npmjs.com/package/axios) for implementing http requests from the browser.
```
gr0kchain@bitcoindev $ npm install axios
gr0kchain@bitcoindev $ cp ./node_modules/qrcode/build/qrcode.min.js ./static/
```

3. Next, we'll create a Web component for our address element at `static/address.html`

  ```
<template id="bitcoin-address">
    <div> Address
      <slot name="address">Address goes here</slot>
    </div>
</template>
<script language="javascript" src="axios.min.js">
</script>
<script>
  (function() {
    // Update our bitcoin-address element with an address from the server
    axios.get('/address').then((resp) => {
      if ( /address\/bitcoin/.test(resp.headers['content-type'])) {
        document.getElementsByTagName("bitcoin-address")[0].innerHTML = "<span slot='address'>" + resp.data.result + "</slot>";
      }
    })

    class BitcoinAddress extends HTMLElement {
      constructor() {
        super();
        const template = document.querySelector('link[rel="import"]').import
        const templateContent = template.getElementById("bitcoin-address").content
        const shadowRoot = this.attachShadow({ mode: "open" }).appendChild(
          templateContent.cloneNode(true)
          )
      }
    }

    customElements.define("bitcoin-address", BitcoinAddress);
  })()
</script>
```
  > **Note** We are intentionally only rendering this element assuming we've received a `content-type` of `address/bitcoin` in the response headers from our server.

4. Update our `index.js` file to serve this html file
```console
const path = require('path');
app.use('/static', express.static(path.join(__dirname, 'static')))
```

5. Finally, let's add our newly created web component to our html file

  ```console
  <!doctype html>
  <html>
    <head>
      <title>Bitcoin Markup</title>
      <link rel="import" href="address.html">
    </head>
    <body>
      <bitcoin-address>
      </bitcoin-address>
    </body>
  </html>
  ```

6. We can test to see if this works by opening the page in our browser.

  ![](assets/address_component.png)

  > **Note** Due to the RPC call to our server, each refresh should show a new address.


### Adding some features

So we've been able to print out the address creating our very own custom bitcoin web components. How about we customise this to render a QR Code for us.

1. Update our `address.html` template to include a `canvas` element.

  ```console
  <template id="bitcoin-address">
      <div>Address<br />
        <canvas id="canvas"></canvas>
        <div>
          <slot name="address">Address goes here</slot>
        </div>
      </div>
  </template>
  ```

2. We should add a [qrcode](https://www.npmjs.com/package/qrcode) package to our application.

```console
gr0kchain@bitcoindev $ npm install qrcode
gr0kchain@bitcoindev $ cp ./node_modules/qrcode/build/qrcode.min.js ./static/
```

3. Update our `address.html` to reference `qrcode.min.js`
  ```console
  <template id="bitcoin-address">
      <div>Address<br />
        <canvas id="canvas"></canvas>
        <div>
          <slot name="address">Address goes here</slot>
        </div>
      </div>
  </template>
  <script src="qrcode.min.js">
  </script>
  ```

4. Update our `address.html` to implement the `connectedCallback` method, and move our `axios` request together with `qrcode` generation here.

  ```console

    (function() {
      // Update our bitcoin-address element with an address from the server

      class BitcoinAddress extends HTMLElement {
        constructor() {
          super();
          const template = document.querySelector('link[rel="import"]').import
          const templateContent = template.getElementById("bitcoin-address").content
          const shadowRoot = this.attachShadow({ mode: "open" }).appendChild(
            templateContent.cloneNode(true)
          )
        }

        connectedCallback() {
          axios.get('/address').then((resp) => {
            if ( /address\/bitcoin/.test(resp.headers['content-type'])) {
              document.getElementsByTagName("bitcoin-address")[0].innerHTML = "<span slot='address'>" + resp.data.result + "</slot>";
              var canvas = document.getElementsByTagName('bitcoin-address')[0].shadowRoot.childNodes[1].childNodes[3]
              var elements = document.getElementsByTagName('bitcoin-address')
              QRCode.toCanvas(canvas, "bitcoin:" + resp.data.result, function (error) {
                if (error) console.error(error)
                  console.log('success!');
              })
            }
          })
        }
      }
      customElements.define("bitcoin-address", BitcoinAddress);
    })()
  ```
5. Test to see if our QR code renders by refreshing out application in the browser.
  ![](assets/qr_code.png)


> Imagine the power of combining this by extending your browser with a browser extension.

We can extend our application with additional content types for handling primitives including `transactions` and `blocks`. Why not try and implement these yourself.

As a bonus, Andreas also hinted at expressing transactions as Emojis, so writing an encoder/decoder for this should be fun!  

## Conclusion

In this tutorial, we looked at how treating Bitcoin as a new content type within context of the web might be implemented.

## Reference

[Steganography.js](https://www.peter-eigenschink.at/projects/steganographyjs/)

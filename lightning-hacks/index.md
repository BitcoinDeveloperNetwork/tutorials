# Lightning Hacks Series

## Introduction

On linux, c-lightning exposes it's rpc interface via a unix domain socket, you can communicate to this directly as follows 

`nc -U ~/.lightning/lightning-rpc`

The provide the following JSON rpc request

`{ "method" : "getinfo", "params" : [], "id" : "1" }`

It's a bit pedantic on JSON parse errors and will segfault on any format issues

Alternatlvely you can fire up something like lightning charge https://github.com/ElementsProject/lightning-charge

To expose this over a TCP socket try 

`socat TCP-LISTEN:12345 UNIX-CONNECT:/path/to/.lightning/lightning-rpc`

Then you can pass these rpc commands over the raw socket

Think you can also set this up via  trivial cli over http, or configure it via something like nginx 

```console
upstream myapp 
{
  server unix:/path/to/.lightning/lightning-rpc
}

server {
  listen 80;

  location / {
    proxy_pass http://myapp;
  }
}
```

Docker example on their readme has some info on how to do this via containers

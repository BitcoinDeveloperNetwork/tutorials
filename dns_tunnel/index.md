# Connecting to bitcoin over a DNS tunnel

## Overvew

Relaying a bitcoin transaction might sometimes be tricky if you're stuck behind a firewall or caught up in some scenarios where a captive portal prevents access via a free wifi hotspot provider. In some cases, these scenarios might still provide access to DNS without any limitation. In this tutorial, we will demonstrate a mechanism through which you can access a bitcoin node over a DNS tunnel.

## Prerequisite

You will need access to a bitcoin node. We suggest executing against a node configured in `regtest` mode so that we can have the freedom of playing with various scenarios without having to loose real money. You can however execute these against either the `testnet` or `mainnet` configurations.

> **Note:**
> If you don't currently have access to a bitcoin development environment set up, dont' worry, we have your back! We've setup a web based mechanism which provisions your very own private session that includes these tools and comes preconfigured with a bitcoin node in `regtest` mode. https://bitcoindev.network/bitcoin-cli-sandbox/
> Alternatively, we have also provided a simple docker container configured in `regtest` mode that you can install for testing purposes.
> ```console
> gr0kchain:~ $ docker volume create --name=bitcoind-data
> gr0kchain:~ $ docker run -v bitcoind-data:/bitcoin --name=bitcoind-node -d \
>      -p 18444:18444 \
>      -p 127.0.0.1:18332:18332 \
>      bitcoindevelopernetwork/bitcoind-regtest
> ```

You can also check for available nodes by following the details of our [Bitcoin network statistics](https://bitcoindev.network/bitcoin-network-statistics/) tutorial.

In addition to this, we will need a remote server that we will be using to configure a DNS tunnelling daemon.

## A quick primer on DNS

To understand how we'll use DNS to tunnel data, we'll need a little bit of background on how the domain name system (DNS) works. DNS in its simplest form is an internet standard for translating names to numbers, kind of like directory. The goal of domain names is to provide a mechanism for naming resources in such a way that the names are usable in different hosts, networks, protocol families, internets, and administrative organisations.

It consists of various kinds of record types such as lookups for names to numbers which are called A (Host address) name records, or lookups for names to other names including Canonical name records (CNAME), or even mail MX (Mail eXchange) records. We can see this in action by doing the following lookup.

```shell
gr0kchain@bitcoindev $ dig bitcoindev.network

; <<>> DiG 9.10.6 <<>> bitcoindev.network
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 19950
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 0

;; QUESTION SECTION:
;bitcoindev.network.		IN	A

;; ANSWER SECTION:
bitcoindev.network.	101	IN	A	104.18.46.61
bitcoindev.network.	101	IN	A	104.18.47.61

;; Query time: 11 msec
;; SERVER: 192.168.88.254#53(192.168.88.254)
;; WHEN: Mon Mar 18 23:36:01 SAST 2019
;; MSG SIZE  rcvd: 68
```

Here we can see the name `bitcoindev.network` resolves to an A name record which points to the address `104.18.46.61`. This mechanism is used by various internet applications behind the scenes so that you don't have to remember the IP addresses off by heart.

There is however another interesting record which comes in useful for the purposes of our requirements, and that is defined in the [RFC1035](https://tools.ietf.org/html/rfc1035) specifivation called the TXT record.

```shell
3.3.14. TXT RDATA format

    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    /                   TXT-DATA                    /
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+

where:

TXT-DATA        One or more <character-string>s.

TXT RRs are used to hold descriptive text.  The semantics of the text
depends on the domain where it is found.
```

As indicate by the specification, the TXT data record can be used to store arbitrary text data. We can see this in action by issuing a TXT record query against the DNS servers for the `tutorial.bitcoindev.network` domain as follows.

```shell
gr0kchain@bitcoindev $ dig -t txt tutorial.bitcoindev.network @noah.ns.cloudflare.com

; <<>> DiG 9.10.6 <<>> -t txt tutorial.bitcoindev.network @noah.ns.cloudflare.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 61251
;; flags: qr aa rd; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1
;; WARNING: recursion requested but not available

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 512
;; QUESTION SECTION:
;tutorial.bitcoindev.network.	IN	TXT

;; ANSWER SECTION:
tutorial.bitcoindev.network. 300 IN	TXT	"Hi there bitcoin developer!"

;; Query time: 11 msec
;; SERVER: 173.245.59.133#53(173.245.59.133)
;; WHEN: Mon Mar 18 23:45:33 SAST 2019
;; MSG SIZE  rcvd: 96
```

Here we can see a TXT record for the domain `tutorial.bitcoindev.network` having the value of "Hi there bitcoin developer!".


## Setting up our dns2tcp server

Dns2tcp is a tool for relaying TCP connections over DNS. There is only a simple identification mechanism but no encryption. DNS encapsulation must be considered as an insecure and anonymous transport layer. Resources should be public external services like ssh, ssltunnel or in our case bitcoin! It consists of two components including a server (dns2tcpd) and a client (dns2tcpd).

The following needs to be performed on a server which is not behind the firewall or captive portal network.

1. Install dns2tcp.
  ```shell
  gr0kchain@bitcoindev $ aptitude install dns2tcp
  ```

2. Configure dns2tcp.
  ```shell
  root@ubuntu-512mb-ams2-01:~# cat /etc/dns2tcpd.conf
  listen = 0.0.0.0
  port = 53
  # If you change this value, also change the USER variable in /etc/default/dns2tcpd
  user = nobody
  chroot = /tmp
  domain = dns2tcp.bitcoindev.network
  key = satoshi
  resources = ssh:127.0.0.1:22 , smtp:127.0.0.1:25, bitcoin:52.191.254.47:8333
  ```
  > **Note**
  > We are configuring the listen parameter here to listen on all interfaces so that we can access this server externally.

3. Start dns2tcp.
  ```shell
  gr0kchain@bitcoindev $ nohup dns2tcpd -F -d1 -f /etc/dns2tcpd.conf  &
  ```
4. We can confirm that this is up and running.
  ```shell
  root@ubuntu-512mb-ams2-01:~# netstat -lnp | grep dns2tcp
  udp        0      0 0.0.0.0:53              0.0.0.0:*                           9663/dns2tcpd
  ```

We should now have a dns2tcp daemon running on our remote server.

## Setting up our dns2tcp client

Next, we need to install a copy of tcp2dns on our client machine.

1. . Install dns2tcp.
  ```shell
  gr0kchain@bitcoindev $ aptitude install dns2tcp
  ```
2. Discover the remote server connection types.

  ```shell
  gr0kchain@bitcoindev $ dns2tcpc -z dns2tcp.bitcoindev.network -k satoshi 198.211.119.30
  Available connection(s) :
  	ssh
  	smtp
  	bitcoin

  Note : Compression SEEMS available !
  ```

  Great! we can see the three services we have configured.

3. Create a local configuration file with the details for connecting to our server.

  ```shell
  gr0kchain@bitcoindev $ cat ~/.dns2tcpc
  domain = dns2tcp.bitcoindev.network
  resource = bitcoin
  local_port = 8332
  debug_level = 1
  key = satoshi
  server = 198.211.119.30
  ```

  > **Note**
  > The details for your domain, key need to patch that of those configured on our server. The server ip here is the ip of the remote server currently running `dns2tcpd`.

4. Start the dns2tcpc client.
```shell
gr0kchain@bitcoindev $ dns2tcpc -f ~/.dns2tcpc
debug level 1
Listening on port : 8333
```









## Conclusion

In conclusion, we review the goals and purpose of the tutorial.

## Reference

* [tcp2dns](https://github.com/alex-sector/dns2tcp)

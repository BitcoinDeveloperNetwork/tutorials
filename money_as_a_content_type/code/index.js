const express = require('express');
const app = express();
const RpcClient = require('bitcoind-rpc');
const path = require('path');
app.use('/static', express.static(path.join(__dirname, 'static')))

var config = {
    protocol: 'http',
    user: 'bitcoin',
    pass: 'local321',
    host: '127.0.0.1',
    port: '18332',
};

const rpc = new RpcClient(config);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/address', (req, res) => {
  res.set('Content-Type', 'address/bitcoin');
  rpc.getNewAddress(function(err, resp) {
    res.send(resp);
  })
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

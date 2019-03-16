var level = require('level')
  var db = level('/home/gr0kchain/.bitcoin/regtest_backup/chainstate/',{ keyEncoding: 'hex', valueEncoding: 'hex' })

  var obfkey;
  db.createReadStream({ gte: '\x63', lt: '\x64' })
    .on('data', function (data) {
      if (data.key == '0e006f62667573636174655f6b6579') {
        console.log("obfuscate_key", data)
      } else {
        console.log("record", data)
      }
    })
    .on('error', function (err) {
      console.log('Oh my!', err)
    })
    .on('close', function () {
      console.log('Stream closed')
    })
    .on('end', function () {
      console.log('Stream ended')
    })

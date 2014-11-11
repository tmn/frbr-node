var ExistConnection = require('./existdb-node')
var options = require('./config.json')


var conn = new ExistConnection(options.dev)


conn.get('/db/frbrsearch/data/frbrxml', function (res) {
  var data = []

  res.on('data', function (chunk) {
    data.push(chunk)
  })

  res.on('end', function () {
    console.log(data.join(''));
  })

  res.on('error', function (err) {
    console.log(err);
  })
})

var query = conn.query('distinct-values(collection(\'/db/frbrsearch/data/frbrxml\')/marc:record[ft:query(., $query) and @f:type = "http://iflastandards.info/ns/fr/frbr/frbrer/C1005"]/@f:id)')

query.each(function (item, hits, offset) {
  console.log(item);
  console.log(hits);
  console.log(offset);
  console.log('-------------------------');
})

var ExistConnection = require('./existdb-node')
var fs = require('fs')
var options = require('./config.json')

var conn = new ExistConnection(options.dev)

var std = {
  PERSON: 'http://iflastandards.info/ns/fr/frbr/frbrer/C1005',
  WORK: 'http://iflastandards.info/ns/fr/frbr/frbrer/C1001',
  EXPRESSION: 'http://iflastandards.info/ns/fr/frbr/frbrer/C1002',
  MANIFESTATION: 'http://iflastandards.info/ns/fr/frbr/frbrer/C1003'
}

/* var get_resource = function (resource) {
  conn.get('/db/frbrsearch/data/frbrxml/' + resource + '.xml', function (res) {
    var data = []

    res.on('data', function (chunk) {
      data.push(chunk)
    })

    res.on('end', function () {
      // console.log(data.join(''));
    })

    res.on('error', function (err) {
      console.log(err);
    })
  })
} */

var xq_query = fs.readFileSync("query.xql", "UTF-8")
var query = conn.query(xq_query, { chunkSize: 1000 })

var tQuery = function () {

  var search_type = process.argv[2].toUpperCase()
  var search_query = process.argv.slice(3).join(' ')

  query.bind('query', search_query)
  query.bind('type', std[search_type])

  query.each(function (rows) {
    if (rows === null) {
      return console.error('   Something went wrong')
    }

    if (Array.isArray(rows)) {
      rows.forEach(function(row) {
        console.log('   %s\t\t%s', row.id, row.score)
      });
    }
    else {
      console.log('   %s\t\t%s', rows.id, rows.score)
    }
  })
}

query.on('error', function (err) {
  console.log('Something went wrong: ' + err)
})

tQuery()

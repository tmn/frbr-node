var ExistConnection = require('./existdb-node')
var fs = require('fs')
var options = require('./config.json')

var conn = new ExistConnection(options.dev)

var get_resource = function (resource) {
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
}

var search_query = process.argv.slice(2).join(' ')
var xq_query = fs.readFileSync("query.xql", "UTF-8")

var query = conn.query(xq_query)
query.bind('query', search_query)

console.log('Query:', search_query);
console.log('--------------------------------------------');

query.each(function (item, hits, offset) {
  console.log('- ', item, hits, offset);
})

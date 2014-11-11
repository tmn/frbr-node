var fs = require('fs')

var ExistConnection = require('./existdb-node')
, options = require('./config.json')

var Node = require('./Node')
, Type = require('./Type')

var conn = new ExistConnection(options.dev)

var nodes = {}
var persons = {}
, works = {}
, expressions = {}
, manifestations = {}

var xq_query = fs.readFileSync("query.xql", "UTF-8")
var query = conn.query(xq_query, { chunkSize: 1000 })

var get_relations = function () {

}

var tQuery = function () {

  var search_type = process.argv[2].toUpperCase()
  var search_query = process.argv.slice(3).join(' ')

  query.bind('query', search_query)
  query.bind('type', Type[search_type])

  query.each(function (rows) {
    if (rows === null) {
      return console.error('   Something went wrong')
    }

    if (Array.isArray(rows)) {
      rows.forEach(function(row) {
        nodes[row.id] = new Node(row.id, row.type, row.score, row.content.record)
      });
    }
    else {
      console.log('   %s\t\t%s', rows.id, rows.type, rows.score, rows.content)
    }
  })
}

query.on('error', function (err) {
  console.log('Something went wrong: ' + err)
})

tQuery()

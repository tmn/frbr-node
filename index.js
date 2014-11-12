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


var build_search_structure = function (query, list) {
  query.each(function (rows) {
    if (rows === null) {
      return console.error('--- no data found')
    }

    if (Array.isArray(rows)) {
      rows.forEach(function(row) {
        list[row.id] = new Node(row.id, row.type, row.score, row.content.record)
      });
    }
    else {
      console.log('   %s\t\t%s', rows.id, rows.type, rows.score)
    }
  })
}


var xq_query      = fs.readFileSync("query.xql", "UTF-8")
, search_type   = process.argv[2].toUpperCase()
, search_query  = process.argv.slice(2).join(' ')

if (Type[search_type] === undefined) {
  search_type = 'PERSON'
}
else {
  search_query = process.argv.slice(3).join(' ')
}


var query_person      = conn.query(xq_query, { chunkSize: 1000 })
, query_work          = conn.query(xq_query, { chunkSize: 1000 })
, query_expression    = conn.query(xq_query, { chunkSize: 1000 })
, query_manifestation = conn.query(xq_query, { chunkSize: 1000 })

query_person.bind('type', Type.PERSON)
query_person.bind('query', search_query)

query_work.bind('type', Type.WORK)
query_work.bind('query', search_query)

query_expression.bind('type', Type.EXPRESSION)
query_expression.bind('query', search_query)

query_manifestation.bind('type', Type.MANIFESTATION)
query_manifestation.bind('query', search_query)

query_person.on('end', function (data) {
  console.log('person end', this.variables);
  console.log();
})
query_work.on('end', function (data) {
  console.log('work end', this.variables);
  console.log();
})
query_expression.on('end', function (data) {
  console.log('expression end', this.variables);
  console.log();
})
query_manifestation.on('end', function (data) {
  console.log('manifestation end', this.variables);
  console.log();
})

build_search_structure(query_person, persons)
build_search_structure(query_work, works)
build_search_structure(query_expression, expressions)
build_search_structure(query_manifestation, manifestations)


/* TEST QUERY
------------------------------------------------------------------------------*/
var query         = conn.query(xq_query, { chunkSize: 1000 })
query.bind('query', search_query)
query.bind('type', Type[search_type])

var test_query = function () {
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
      console.log('   %s\t\t%s', rows.id, rows.type, rows.score)
    }
  })
}

query.on('error', function (err) {
  console.log('Something went wrong: ' + err)
})

query.on('end', function (data, type) {
  // console.log('END: ' + data)
  console.log(this.variables);
})

test_query()

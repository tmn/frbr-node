var fs = require('fs')

var ExistConnection = require('../existdb-node')
, options = require('../config.json')

var Node = require('./Node')
, Type = require('./Type')

module.exports = (function () {
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
        })
      }
      else {
        list[rows.id] = new Node(rows.id, rows.type, rows.score, rows.content.record)
      }
    })
  }


  var xq_query    = fs.readFileSync("xql/query.xql", "UTF-8")
  , search_type   = process.argv[2].toUpperCase()
  , search_query  = process.argv.slice(2).join(' ')

  if (Type[search_type] === undefined) {
    search_type = 'PERSON'
  }
  else {
    search_query = process.argv.slice(3).join(' ')
  }


  var queries = {
    person:         conn.query(xq_query, { chunkSize: 1000 }),
    work:           conn.query(xq_query, { chunkSize: 1000 }),
    expression:     conn.query(xq_query, { chunkSize: 1000 }),
    manifestation:  conn.query(xq_query, { chunkSize: 1000 })
  }


  queries.person.bind('type', Type.PERSON)
  queries.person.bind('query', search_query)

  queries.work.bind('type', Type.WORK)
  queries.work.bind('query', search_query)

  queries.expression.bind('type', Type.EXPRESSION)
  queries.expression.bind('query', search_query)

  queries.manifestation.bind('type', Type.MANIFESTATION)
  queries.manifestation.bind('query', search_query)

  queries.person.on('end', function (data) {
    console.log('person end', this.variables)
    console.log()
  })
  queries.work.on('end', function (data) {
    console.log('work end', this.variables)
    console.log()
  })
  queries.expression.on('end', function (data) {
    console.log('expression end', this.variables)
    console.log()
  })
  queries.manifestation.on('end', function (data) {
    console.log('manifestation end', this.variables)
    console.log()
  })

  build_search_structure(queries.person, persons)
  build_search_structure(queries.work, works)
  build_search_structure(queries.expression, expressions)
  build_search_structure(queries.manifestation, manifestations)









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
        })
      }
      else {
        console.log('   %s\t\t%s', rows.id, rows.type, rows.score)
      }
    })
  }

  query.on('error', function (err) {
    console.log('Something went wrong: ' + err)
  })

  query.on('end', function (data) {
    console.log(this.variables)
    console.log()
  })

  test_query()
})()

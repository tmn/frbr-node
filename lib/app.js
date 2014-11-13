var fs = require('fs')

var ExistConnection = require('../existdb-node')
, options = require('../config.json')

var Node = require('./Node')
, Type = require('./Type')

module.exports = (function () {
  var conn = new ExistConnection(options.dev)

  var nodes = {}
  var persons = []
  , works = []
  , expressions = []
  , manifestations = []

  var persons_map = { done: false }
  , works_map = { done: false }
  , expressions_map = { done: false }
  , manifestations_map = { done: false }

  var build_data_structure = function (query, list) {
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









/* TODO: calculate product of separate scores
------------------------------------------------------------------------------*/

  var get_relationship = function (resource) {
    if (resource.doc === undefined || resource.doc.relationship === undefined) {
      return
    }

    resource.doc.relationship.forEach(function (e) {
      if (e['f:type'] === 'http://iflastandards.info/ns/fr/frbr/frbrer/P2010') {
        if (resource.works.indexOf(e['f:href']) === -1) {
          resource.works.push(e['f:href'])
        }

        if (works_map[e['f:href']].persons.indexOf(resource.id) === -1) {
          works_map[e['f:href']].persons.push(resource.id)
        }

      }
      else if (e['f:type'] === 'http://iflastandards.info/ns/fr/frbr/frbrer/P2009') {
        if (resource.works.indexOf(e['f:href']) === -1) {
          resource.persons.push(e['f:href'])
        }
      }
    })
  }

  var calculate_product = function () {
    
  }

  var is_done = function () {
    if (persons_map.done && works_map.done && expressions_map.done && manifestations_map.done) {
      for (var key in persons_map) {
        get_relationship(persons_map[key])
      }
      console.log(persons_map);

      for (var key in works_map) {
        get_relationship(works_map[key])
      }
      //console.log(works_map);
    }
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
    // is_done()

    console.log('person end', this.variables)
    console.log()
  })
  queries.work.on('end', function (data) {
    // is_done()

    console.log('work end', this.variables)
    console.log()
  })
  queries.expression.on('end', function (data) {
    // is_done()

    console.log('expression end', this.variables)
    console.log()
  })
  queries.manifestation.on('end', function (data) {
    // is_done()

    console.log('manifestation end', this.variables)
    console.log()
  })

  // build_data_structure(queries.person, persons_map)
  // build_data_structure(queries.work, works_map)
  // build_data_structure(queries.expression, expressions_map)
  // build_data_structure(queries.manifestation, manifestations_map)


/*-----------------------------------------------------------------------------*/








  var do_search = function () {
    if (persons_map.done && works_map.done && expressions_map.done && manifestations_map.done) {
      var query = conn.query(fs.readFileSync("xql/search.xql", "UTF-8"), { chunkSize: 1000 })
      query.bind('query', search_query)

      query.each(function (rows) {
        rows.forEach(function (row) {
          console.log(row);
        })
      })
    }
  }

  var init = function () {
    var qp = conn.query(fs.readFileSync("xql/persons.xql", "UTF-8"), { chunkSize: 1000 })
    var qw = conn.query(fs.readFileSync("xql/works.xql", "UTF-8"), { chunkSize: 1000 })
    var qe = conn.query(fs.readFileSync("xql/expressions.xql", "UTF-8"), { chunkSize: 1000 })
    var qm = conn.query(fs.readFileSync("xql/manifestations.xql", "UTF-8"), { chunkSize: 1000 })

    build_data_structure(qp, persons_map)
    build_data_structure(qw, works_map)
    build_data_structure(qe, expressions_map)
    build_data_structure(qm, manifestations_map)

    qp.on('end', function (data) {
      persons_map.done = true
      do_search()
      // console.log(persons_map['9b2168d5-26bd-3d1d-81bb-ef512aefaee8']);
    })

    qw.on('end', function (data) {
      works_map.done = true
      do_search()
    })

    qe.on('end', function (data) {
      expressions_map.done = true
      do_search()
    })

    qm.on('end', function (data) {
      manifestations_map.done = true
      do_search()
    })
  }


  init()




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
          // nodes[row.id] = new Node(row.id, row.type, row.score, row.content.record)
          console.log('   %s\t\t%s', row.id, row.type, row.score)
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

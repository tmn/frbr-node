var async = require('async')
, fs = require('fs')

var ExistConnection = require('../existdb-node')
, options = require('../config.json')

var Node = require('./Node')
, Type = require('./Type')


var conn = new ExistConnection(options.dev)

var nodes = {}
var persons = []
, works = []
, expressions = []
, manifestations = []

var persons_map = {}
, works_map = {}
, expressions_map = {}
, manifestations_map = {}

var persons_result_map = {}
, works_result_map = {}
, expressions_result_map = {}
, manifestations_result_map = {}


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
, search_query  = process.argv.slice(2).join(' ')






/* TODO: calculate product of separate scores
------------------------------------------------------------------------------*/
var get_relationship = function (resource) {
  if (resource.doc === undefined || resource.doc.relationship === undefined) {
    return
  }

  // console.log(resource.doc)
  resource.doc.relationship.forEach(function (e) {
    // is creator (person) of
    if (e['f:type'] === 'http://iflastandards.info/ns/fr/frbr/frbrer/P2010') {
      if (works_result_map[e['f:href']] && resource.works.indexOf(e['f:href']) === -1) {
        resource.works.push(e['f:href'])
      }

      if (works_result_map[e['f:href']] !== undefined && works_result_map[e['f:href']].persons.indexOf(resource.id) === -1) {
        works_result_map[e['f:href']].persons.push(resource.id)
      }

    }
    // is created by (person)
    else if (e['f:type'] === 'http://iflastandards.info/ns/fr/frbr/frbrer/P2009') {
      if (persons_result_map[e['f:href']] && resource.persons.indexOf(e['f:href']) === -1) {
        resource.persons.push(e['f:href'])
      }

      if (persons_result_map[e['f:href']] !== undefined && persons_result_map[e['f:href']].works.indexOf(resource.id) === -1) {
        persons_result_map[e['f:href']].works.push(resource.id)
      }
    }
  })
}

var calculate_product = function () {

}

var is_done = function (callback) {
  if (persons_result_map.done && works_result_map.done && expressions_result_map.done && manifestations_result_map.done) {

    for (var key in persons_result_map) {
      get_relationship(persons_result_map[key])
    }

    for (var key in works_result_map) {
      get_relationship(works_result_map[key])
    }

    console.log('------------------------------------------------------------');
    console.log(persons_result_map);
    console.log('============================================================');
    console.log(works_result_map);
    console.log('------------------------------------------------------------');

    callback()
  }
}
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

  async.parallel([
    function (callback) {
      qp.on('end', function (data) {
        callback(null, persons_map)
      })
    },
    function (callback) {
      qw.on('end', function (data) {
        callback(null, works_map)
      })
    },
    function (callback) {
      qe.on('end', function (data) {
        callback(null, expressions_map)
      })
    },
    function (callback) {
      qm.on('end', function (data) {
        callback(null, manifestations_map)
      })
    }
  ],
  function (err, results) {
    // all results are in!
  })
}




var reset_result_maps = function () {
  persons_result_map = {}
  works_result_map = {}
  expressions_result_map = {}
  manifestations_result_map = {}
}


module.exports = {
  init: init,

  search: function (query, db) {
    reset_result_maps()

    var queries = {
      person:         conn.query(xq_query, { chunkSize: 1000 }),
      work:           conn.query(xq_query, { chunkSize: 1000 }),
      expression:     conn.query(xq_query, { chunkSize: 1000 }),
      manifestation:  conn.query(xq_query, { chunkSize: 1000 })
    }

    queries.person.bind('type', Type.PERSON)
    queries.work.bind('type', Type.WORK)
    queries.expression.bind('type', Type.EXPRESSION)
    queries.manifestation.bind('type', Type.MANIFESTATION)

    queries.person.bind('query', query)
    queries.work.bind('query', query)
    queries.expression.bind('query', query)
    queries.manifestation.bind('query', query)

    build_data_structure(queries.person, persons_result_map)
    build_data_structure(queries.work, works_result_map)
    build_data_structure(queries.expression, expressions_result_map)
    build_data_structure(queries.manifestation, manifestations_result_map)

    async.parallel([
      function (callback) {
        queries.person.on('end', function (data) {
          callback(null, persons_result_map)
        })
      },
      function (callback) {
        queries.work.on('end', function (data) {
          callback(null, works_result_map)
        })
      },
      function (callback) {
        queries.expression.on('end', function (data) {
          callback(null, expressions_result_map)
        })
      },
      function (callback) {
        queries.manifestation.on('end', function (data) {
          callback(null, manifestations_result_map)
        })
      }
    ],
    function (err, result) {
      db(result)
    })
  }
}

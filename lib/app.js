var async           = require('async')
, ExistConnection   = require('../existdb-node')
, fs                = require('fs')

var options         = require('../config.json')

var Node            = require('./Node')
, Type              = require('./Type')


/*
------------------------------------------------------------------------------*/
var conn = new ExistConnection(options.dev)
var search_res = null

var tree = [
  {
    name: 'root',
    children: []
  }
]

var persons_map               = {}
, works_map                   = {}
, expressions_map             = {}
, manifestations_map          = {}

var persons_result_map        = {}
, works_result_map            = {}
, expressions_result_map      = {}
, manifestations_result_map   = {}

var xq_query                  = fs.readFileSync("xql/query.xql", "UTF-8")
, search_query                = process.argv.slice(2).join(' ')


/*
------------------------------------------------------------------------------*/
var build_data_structure
, build_rels
, do_i_exist
, do_ultimate_search
, init
, make_tree
, reset_result_maps
, search


build_data_structure = function (query, list) {
  query.each(function (rows) {
    if (rows === null) {
      return console.error('--- no data found')
    }

    if (Array.isArray(rows)) {
      rows.forEach(function(row) {
        list[row.id] = new Node(row.id, row.type, row.score, row.content.record)
        list[row.id].hit = true
      })
    }
    else {
      list[rows.id] = new Node(rows.id, rows.type, rows.score, rows.content.record)
      list[rows.id].hit = true
    }

  })
}


build_rels = function (root, item) {
  if (do_i_exist(root.children, item) || do_i_exist(item.children, root)) {
    return
  }

  if (item.name) {
    root.children.push(item)
  }

  if (item.doc !== undefined && item.doc.relationship.length > 0) {
    item.doc.relationship.forEach(function (rel) {
      search_res.forEach(function (res) {
        if (res[rel['href']]) {
          build_rels(item, res[rel['href']])
        }
      })
    })
  }
}


do_i_exist = function (list, item) {
  for (var i = 0, n = list.length; i < n; i++) {
    if (list[i].id == item.id) {
      return true
    }
  }
  return false
}


/* This method liek make other shit in their pants
------------------------------------------------------------------------------*/
do_ultimate_search = function () {
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


make_tree = function (root, data) {
  for (var key in data) {
    build_rels(root, data[key])
  }
}


reset_result_maps = function () {
  persons_result_map = {}
  works_result_map = {}
  expressions_result_map = {}
  manifestations_result_map = {}
}


search = function (query, db) {
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
      tree = [
    {
      name: 'root',
      children: []
    }
    ]


    search_res = result

    make_tree(tree[0], search_res[1])
    make_tree(tree[0], search_res[0])
    make_tree(tree[0], search_res[2])
    make_tree(tree[0], search_res[3])

    db(tree[0])
  })
}


init = function () {
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
    console.log('Initiated!');
  })
}


module.exports = {
  init: init,
  search: search
}

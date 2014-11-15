var engines = require('consolidate')
, express = require('express')
, path = require('path')

var frbr = require('./app')
frbr.init()

var app = express()

app.set('views', 'views')
app.set('view engine', 'html')

app.engine('html', engines.hogan)

app.use(express.static('public'))

app.get('/', function (req, res) {
  res.render('index', { title: 'master' })
})

app.get('/s/:query', function (req, res) {
  var query = req.params.query

  frbr.search(query, function (data) {
    res.send(data)
  })
})

app.listen(3000)
module.exports = app

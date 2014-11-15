var engines = require('consolidate')
, express = require('express')
, path = require('path')

var frbr = require('./app')
var app = express()
, server = require('http').Server(app)
, io = require('socket.io')(server)

server.listen(3000)
frbr.init()

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

io.on('connection', function (socket) {
  console.log('new user connected');

  socket.on('search', function (search) {
    frbr.search(search.message, function (data) {
      io.emit('results', data)
    })
  })
})

module.exports = app

var io = require('socket.io-client')('http://localhost');
io.on('connect', function(){
  console.log('asdfasdfsdf connect');
  io.on('event', function(data){});
  io.on('disconnect', function(){});
});

var results = document.getElementById('results')
, search_button = document.getElementById('search-button')
, search_field = document.getElementById('search-field')

var query_search = function () {
  io.emit('search', {
    message: search_field.value,
    timestamp: new Date().toLocaleTimeString().replace(/\./g, ':')
  })
}

search_button.addEventListener('click', query_search)

search_field.addEventListener('keyup', function (e) {
  e.preventDefault()

  if (e.keyCode === 13) {
    query_search()
  }
})


io.on('results', function (data) {
  results.innerHTML = JSON.stringify(data)
})

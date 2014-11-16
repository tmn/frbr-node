var io = require('socket.io-client')('http://localhost');

var render = require('./renderResult')

var results = document.getElementById('results')
, search_button = document.getElementById('search-button')
, search_field = document.getElementById('search-field')

var query_search = function () {
  if (search_field.value.length === 0) {
    return
  }

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
  while (results.firstChild){
    results.removeChild(results.firstChild)
  }

  data.forEach(function(list) {
    for (var key in list) {
      // results.insertBefore(render(list[key]), results.firstChild)
      results.appendChild(render(list[key]))
    }
  })
})

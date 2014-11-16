var domify = require('domify')

module.exports = function renderResult(result) {
  return domify(
    '<article>' +
      '<strong>Type:</strong> ' + result.type + '<br>' +
      '<strong>Score:</strong> ' + result.score + '<br>' +
      result.id +
    '</article>'
  )
}

var domify = require('domify')

module.exports = function renderResult(result) {
  return domify(
    '<article>' +
      result.id +
    '</article>'
  )
}

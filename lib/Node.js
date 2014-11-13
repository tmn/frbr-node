var Node = function Node(id, type, score, doc) {
  this.id = id
  this.type = type
  this.score = score
  this.doc = doc

  this.root = false
  this.hit = false

  this.persons = []
  this.works = []
  this.expressions = []
  this.manifestations = []
}

module.exports = Node;
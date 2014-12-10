var Node = function Node(id, type, score, doc) {
  this.id = id
  this.name = id
  this.type = type
  this.score = score
  this.doc = doc

  this.product = 0

  this.root = false
  this.hit = false
  this.used = false

  this.children = []



  // this.persons = []
  // this.works = []
  // this.expressions = []
  // this.manifestations = []
}

module.exports = Node;

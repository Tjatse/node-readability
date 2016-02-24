var read = require('../')
var chai = require('chai')
var expect = chai.expect
var should = chai.should()

describe('custom damping', function () {
  var html = '<title>TIDY!!!!!</title><body><div><div><div><p>Hola!!!! Real Madrid!!!!!!!!!!!!!!</p></div></div><p>-Tjatse</p></div></body>'

  describe('by default', function () {
    it('will get no author', function (done) {
      read({
        html: html
      }, function (err, art) {
        should.not.exist(err)
        expect(art).to.be.an('object')
        art.content.should.not.contain('Tjatse')
        done()
      })
    })
  })

  describe('by 2', function () {
    it('will get author', function (done) {
      read({
        html: html,
        damping: 2
      }, function (err, art) {
        should.not.exist(err)
        expect(art).to.be.an('object')
        art.content.should.contain('Tjatse')
        done()
      })
    })
  })
})

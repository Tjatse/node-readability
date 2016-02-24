var read = require('../')
var chai = require('chai')
var expect = chai.expect
var should = chai.should()

describe('find exact title', function () {
  describe('length less than 10 before separator', function () {
    it('should remove separator', function (done) {
      read('<title>The | whole title including separator</title><body></body>', function (err, art) {
        should.not.exist(err)
        expect(art).to.be.an('object')
        art.title.should.equal('The whole title including separator')
        done()
      })
    })
  })

  ;['|', '-', '_', '«', '»'].forEach(function (s) {
    describe('better title', function () {
      it('split with ' + s, function (done) {
        read('<title>Chapter of readability ' + s + ' Tjatse</title><body></body>', function (err, art) {
          should.not.exist(err)
          expect(art).to.be.an('object')
          art.title.should.equal('Chapter of readability')
          done()
        })
      })
    })
  })

  describe('title split with multi separators', function () {
    it('should returns the first found length greater than 10', function (done) {
      read('<title>Chapter | Demonstration of readability - Tjatse</title><body></body>', function (err, art) {
        should.not.exist(err)
        expect(art).to.be.an('object')
        art.title.should.equal('Chapter Demonstration of readability')
        done()
      })
    })
  })

  describe('better title', function () {
    var article = '<title>Chapter Demonstration of readability_Node.js_readability_GitHub</title><body></body>'

    it('by default', function (done) {
      read({
        html: article
      }, function (err, art) {
        should.not.exist(err)
        art.title.should.equal('Chapter Demonstration of readability')
        done()
      })
    })

    it('minLength', function (done) {
      read({
        html: article,
        betterTitle: 1000
      }, function (err, art) {
        should.not.exist(err)
        console.log(art.title)
        art.title.should.contain('GitHub')
        done()
      })
    })

    it('fn', function (done) {
      read({
        html: article,
        betterTitle: function (t) {
          return '[Github]' + t
        }
      }, function (err, art) {
        should.not.exist(err)
        console.log(art.title)
        art.title.should.contain('[Github]')
        art.title.should.contain('readability')
        done()
      })
    })
  })
})

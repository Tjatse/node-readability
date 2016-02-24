var read = require('../')
var chai = require('chai')
var expect = chai.expect
var should = chai.should()

describe('threshold', function () {
  var html = '<title>read-art</title><body><div><foo>bar</foo>hi, dude, i am <blockquote>readability</blockquote>, aka read-art...</div></body>'
  describe('threshold score', function () {
    describe('wrong type', function () {
      var cases = {'string': 'abc', 'function': function () {}, 'boolean': true, 'array': []}
      for (var c in cases) {
        it(c, function (done) {
          read({
            html: html,
            thresholdScore: cases[c],
            minTextLength: 0
          }, function (err, art) {
            should.not.exist(err)
            expect(art).to.be.an('object')
            art.title.should.equal('read-art')
            art.content.should.contain('readability')
            art.content.should.contain('read-art')
            done()
          })
        })
      }
    })

    describe('number', function () {
      it('keep <foo>', function (done) {
        read({
          html: html,
          thresholdScore: -1,
          minTextLength: 0
        }, function (err, art) {
          should.not.exist(err)
          expect(art).to.be.an('object')
          art.title.should.equal('read-art')
          art.content.should.contain('readability')
          art.content.should.contain('<foo')
          done()
        })
      })
      it('remove <foo>', function (done) {
        read({
          html: html,
          thresholdScore: 1,
          minTextLength: 0
        }, function (err, art) {
          should.not.exist(err)
          expect(art).to.be.an('object')
          art.title.should.equal('read-art')
          art.content.should.contain('readability')
          art.content.should.not.contain('<foo')
          done()
        })
      })
    })

    describe('function', function () {
      it('keep <foo>', function (done) {
        read({
          html: html,
          thresholdScore: function (node, scoreKey) {
            arguments.should.have.length(2)
            scoreKey.should.be.a('string')
            node.should.be.an('object')
            return -1
          },
          minTextLength: 0
        }, function (err, art) {
          should.not.exist(err)
          expect(art).to.be.an('object')
          art.title.should.equal('read-art')
          art.content.should.contain('readability')
          art.content.should.contain('<foo')
          done()
        })
      })
      it('keep <foo> too', function (done) {
        read({
          html: html,
          thresholdScore: function (node, scoreKey) {
            arguments.should.have.length(2)
            scoreKey.should.be.a('string')
            node.should.be.an('object')
            var score = node.data(scoreKey)
            expect(score).to.be.a('number')
            return Math.min(score, -1)
          },
          minTextLength: 0
        }, function (err, art) {
          should.not.exist(err)
          expect(art).to.be.an('object')
          art.title.should.equal('read-art')
          art.content.should.contain('readability')
          art.content.should.contain('<foo')
          done()
        })
      })
      it('remove <foo>', function (done) {
        read({
          html: html,
          thresholdScore: function (node, scoreKey) {
            arguments.should.have.length(2)
            scoreKey.should.be.a('string')
            node.should.be.an('object')
          },
          minTextLength: 0
        }, function (err, art) {
          should.not.exist(err)
          expect(art).to.be.an('object')
          art.title.should.equal('read-art')
          art.content.should.contain('readability')
          art.content.should.not.contain('<foo')
          done()
        })
      })
      it('remove <foo> too', function (done) {
        read({
          html: html,
          thresholdScore: function (node, scoreKey) {
            arguments.should.have.length(2)
            scoreKey.should.be.a('string')
            node.should.be.an('object')
            var score = node.data(scoreKey)
            expect(score).to.be.a('number')
            return score
          },
          minTextLength: 0
        }, function (err, art) {
          should.not.exist(err)
          expect(art).to.be.an('object')
          art.title.should.equal('read-art')
          art.content.should.contain('readability')
          art.content.should.not.contain('<foo')
          done()
        })
      })
    })
  })

  describe('threshold link density', function () {
    before(function () {
      html = '<title>read-art</title><body><div>hi, dude, i am <blockquote>readability</blockquote>, <p>aka <a href="/path/to">read-art</a></p>...</div></body>'
    })
    describe('wrong type', function () {
      describe('fallback to 0.25 by default', function () {
        var cases = {'string': 'abc', 'function': function () {}, 'boolean': true, 'array': []}
        for (var c in cases) {
          it(c, function (done) {
            read({
              html: html,
              thresholdLinkDensity: cases[c],
              minTextLength: 0
            }, function (err, art) {
              should.not.exist(err)
              expect(art).to.be.an('object')
              art.title.should.equal('read-art')
              art.content.should.contain('readability')
              art.content.should.not.contain('read-art')
              done()
            })
          })
        }
      })
    })

    describe('number', function () {
      it('greater than 1', function (done) {
        read({
          html: html,
          thresholdLinkDensity: 1.5,
          minTextLength: 0
        }, function (err, art) {
          should.not.exist(err)
          expect(art).to.be.an('object')
          art.title.should.equal('read-art')
          art.content.should.contain('readability')
          art.content.should.not.contain('read-art')
          done()
        })
      })
      it('less than 0', function (done) {
        read({
          html: html,
          thresholdLinkDensity: 1.5,
          minTextLength: 0
        }, function (err, art) {
          should.not.exist(err)
          expect(art).to.be.an('object')
          art.title.should.equal('read-art')
          art.content.should.contain('readability')
          art.content.should.not.contain('read-art')
          done()
        })
      })
      it('strict mode: threshold such as 0.01', function (done) {
        read({
          html: html,
          thresholdLinkDensity: 0.01,
          minTextLength: 0
        }, function (err, art) {
          should.not.exist(err)
          expect(art).to.be.an('object')
          art.title.should.equal('read-art')
          art.content.should.contain('readability')
          art.content.should.not.contain('read-art')
          done()
        })
      })
      it('non strict mode: threshold such as 0.99', function (done) {
        read({
          html: html,
          thresholdLinkDensity: 0.99,
          minTextLength: 0
        }, function (err, art) {
          should.not.exist(err)
          expect(art).to.be.an('object')
          art.title.should.equal('read-art')
          art.content.should.contain('readability')
          art.content.should.contain('read-art')
          done()
        })
      })
    })
  })
})

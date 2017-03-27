var read = require('../')
var chai = require('chai')
var expect = chai.expect
var should = chai.should()

describe('force remove related articles', function () {
  var html1 = '<title>read-art</title><body><div><p>hi, dude, i am readability, aka read-art...</p><ul><li><a href="pm2-gui.git">pm2-gui.git</a></li></ul></div></body>'
  var html2 = '<title>read-art</title><body><div><p>hi, dude, i am readability, aka read-art...</p><ul><li><a href="pm2.git">pm2.git</a></li></ul><dl><dt><a href="pm2-gui.git">pm2-gui.git</a></dt><dl></div></body>'
  var html3 = '<title>read-art</title><body><div><p>hi, dude, i am readability, aka read-art...</p><ul><li>repos</li><li><a href="pm2-gui.git">pm2-gui.git</a></li></ul></div></body>'
  describe('when disabled', function () {
    it('should returns related articles list', function (done) {
      read(html1, {
        output: 'text'
      }, function (err, art) {
        should.not.exist(err)
        expect(art).to.be.an('object')
        art.title.should.equal('read-art')
        art.content.should.contain('read-art')
        art.content.should.contain('pm2-gui.git')
        done()
      })
    })
  })

  describe('when enabled (by default)', function () {
    it('should returns content without related articles list (ol, ul)', function (done) {
      read(html1, {
        output: 'text',
        forceRemoveRelated: true
      }, function (err, art) {
        should.not.exist(err)
        expect(art).to.be.an('object')
        art.title.should.equal('read-art')
        art.content.should.contain('read-art')
        art.content.should.not.contain('pm2-gui.git')
        done()
      })
    })
  })

  describe('when enabled (skip dl, ol, ul)', function () {
    before(function () {
      read.use(function () {
        this.relatedTags('dl')
      })
    })
    it('should returns content without related articles list (dl, ol, ul)', function (done) {
      read(html2, {
        output: 'text',
        forceRemoveRelated: true
      }, function (err, art) {
        should.not.exist(err)
        expect(art).to.be.an('object')
        art.title.should.equal('read-art')
        art.content.should.contain('read-art')
        art.content.should.not.contain('pm2-gui.git')
        art.content.should.not.contain('pm2.git')
        done()
      })
    })
  })

  describe('when enabled (skip dl, ol, ul)', function () {
    before(function () {
      read.use(function () {
        this.reset()
        this.relatedTags('dl', true)
      })
    })
    it('should returns content without related articles list (dl) but contains (ul, ol)', function (done) {
      read(html2, {
        output: 'text',
        forceRemoveRelated: true
      }, function (err, art) {
        should.not.exist(err)
        expect(art).to.be.an('object')
        art.title.should.equal('read-art')
        art.content.should.contain('read-art')
        art.content.should.not.contain('pm2-gui.git')
        art.content.should.contain('pm2.git')
        done()
      })
    })
  })

  describe('when enabled (skip ol, ul)', function () {
    before(function () {
      read.use(function () {
        this.reset()
      })
    })
    it('should returns content including related articles list (ol, ul) - link density < 0.8 (by default)', function (done) {
      read(html3, {
        output: 'text',
        forceRemoveRelated: true
      }, function (err, art) {
        should.not.exist(err)
        expect(art).to.be.an('object')
        art.title.should.equal('read-art')
        art.content.should.contain('read-art')
        art.content.should.contain('pm2-gui.git')
        done()
      })
    })

    it('should returns content without related articles list (ol, ul) - link density >= 0.6', function (done) {
      read(html3, {
        output: 'text',
        forceRemoveRelated: true,
        minRelatedDensity: 0.6
      }, function (err, art) {
        should.not.exist(err)
        expect(art).to.be.an('object')
        art.title.should.equal('read-art')
        art.content.should.contain('read-art')
        art.content.should.not.contain('pm2-gui.git')
        done()
      })
    })
  })
})

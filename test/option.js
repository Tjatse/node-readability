var read = require('../')
var Cheerio = require('cheerio')
var chai = require('chai')
var expect = chai.expect // eslint-disable-line
var should = chai.should()

describe('different options', function () {
  var charset = 'utf8'
  var passing = {
    uri: 'http://www.bing.com',
    html: '<body><p>Hello, node-art</p></body>',
    cheerio: Cheerio.load('<body><p>Hey, node-art</p></body>')
  }
  describe('arguments: [String|Cheerio], [Object], [Function]', function () {
    Object.keys(passing).forEach(function (k) {
      it('should detect two options - ' + k, function (done) {
        read(passing[k], {
          charset: charset
        }, function (err, art, options, resp) {
          should.not.exist(err)
          options[k].should.be.equal(passing[k])
          options.charset.should.be.equal(charset)
          if (k === 'uri') {
            resp.statusCode.should.be.equal(200)
          }
          done()
        })
      })
    })
  })

  describe('arguments: [String|Cheerio], [Function]', function () {
    Object.keys(passing).forEach(function (k) {
      it('should detect one options - ' + k, function (done) {
        read(passing[k], function (err, art, options) {
          should.not.exist(err)
          options[k].should.be.equal(passing[k])
          should.not.exist(options.charset)
          done()
        })
      })
    })
  })

  describe('arguments: [Object], [Function]', function () {
    Object.keys(passing).forEach(function (k) {
      it('should detect two options - ' + k, function (done) {
        read({
          uri: passing[k],
          charset: charset
        }, function (err, art, options) {
          should.not.exist(err)
          options[k].should.be.equal(passing[k])
          options.charset.should.be.equal(charset)
          done()
        })
      })
    })
  })

  describe('aguments: [Mixed]', function () {
    Object.keys(passing).forEach(function (k) {
      describe(k + ' is passed in', function () {
        it('should detect ' + k + ' in options', function (done) {
          var opts = {charset: charset}
          opts[k] = passing[k]
          read(opts, function (err, art, options) {
            should.not.exist(err)
            options[k].should.be.equal(passing[k])
            done()
          })
        })
      })
    })

    describe('uri is passed in, but treat as html', function () {
      it('should detect html automatically', function (done) {
        read({
          uri: passing.html,
          charset: charset
        }, function (err, art, options) {
          should.not.exist(err)
          options.html.should.be.equal(passing.html)
          done()
        })
      })
    })

    describe('html is passed in', function () {
      it('should detect html in options', function (done) {
        read({
          uri: passing.html,
          charset: charset
        }, function (err, art, options) {
          should.not.exist(err)
          options.html.should.be.equal(passing.html)
          done()
        })
      })
    })

    describe('uri is passed in, but treat as cheerio', function () {
      it('should detect cheerio automatically (uri)', function (done) {
        read({
          uri: passing.cheerio,
          charset: charset
        }, function (err, art, options) {
          should.not.exist(err)
          options.cheerio.should.be.equal(passing.cheerio)
          done()
        })
      })
      it('should detect cheerio automatically (html)', function (done) {
        read({
          html: passing.cheerio,
          charset: charset
        }, function (err, art, options) {
          should.not.exist(err)
          options.cheerio.should.be.equal(passing.cheerio)
          done()
        })
      })
    })

    describe('html && uri are both passed in', function () {
      it('should divfer using html', function (done) {
        read({
          uri: passing.uri,
          html: passing.html
        }, function (err, art, options) {
          should.not.exist(err)
          passing.html.should.contains(art.content)
          done()
        })
      })
    })
    describe('cheerio && html && uri are both passed in', function () {
      it('should divfer using html', function (done) {
        read({
          uri: passing.uri,
          html: passing.html,
          cheerio: passing.cheerio
        }, function (err, art, options) {
          should.not.exist(err)
          passing.cheerio.html().should.contains(art.content)
          done()
        })
      })
    })
  })

  describe('arguments: [WrongType]', function () {
    describe('[Null]', function () {
      it('should returns error', function (done) {
        var err = read()
        should.exist(err)
        expect(err).to.be.a('error')
        done()
      })
    })
    describe('[Function]', function () {
      it('should returns error', function (done) {
        var err = read(function () {})
        should.exist(err)
        expect(err).to.be.a('error')
        done()
      })
    })
    describe('[Wrong]', function () {
      it('should returns error', function (done) {
        var err = read({})
        should.exist(err)
        expect(err).to.be.a('error')
        done()
      })
    })
    describe('[Wrong], [Wrong]', function () {
      it('should returns error', function (done) {
        var err = read('', {})
        should.exist(err)
        expect(err).to.be.a('error')
        done()
      })
    })
    describe('[String], [Object], [Wrong]', function () {
      it('should auto handle error without exiting', function (done) {
        var err = read(passing.html, {charset: charset}, {})
        should.not.exist(err)
        done()
      })
    })
  })
})

describe('minParagraphs option', function () {
  var passing = {}
  passing.html = '<title>read-art</title><body><div><div><p>hi, dude, i am <a href="/Tjatse/read-art.git">readability</a>, aka read-art...</p></div><span>footer</span></div></body>'
  passing.cheerio = Cheerio.load(passing.html)
  describe('3 by default', function () {
    Object.keys(passing).forEach(function (k) {
      it('should find footer - ' + k, function (done) {
        read({
          minTextLength: 0,
          html: passing[k]
        }, function (err, art, options, resp) {
          should.not.exist(err)
          art.content.should.contain('footer')
          done()
        })
      })
    })
  })
  describe('0 by customized', function () {
    Object.keys(passing).forEach(function (k) {
      it('should find no footer - ' + k, function (done) {
        read({
          minTextLength: 0,
          minParagraphs: 0,
          html: passing[k]
        }, function (err, art, options, resp) {
          should.not.exist(err)
          art.content.should.not.contain('footer')
          done()
        })
      })
    })
  })

  describe('forceDecode', function () {
    it('false, by cheerio', function (done) {
      var article = '<title>title</title>' +
        '<body>' +
        '<p foo="&quot; width=1000 onclick=alert(10) test"> HELLO WORLD</p>' +
        '</body>'

      read({
        html: article
      }, function (err, art) {
        should.not.exist(err)
        art.content.should.contain('&quot')
        done()
      })
    })

    it('true, by entities', function (done) {
      var article = '<title>title</title>' +
        '<body>' +
        '<p foo="&quot; width=1000 onclick=alert(10) test"> HELLO WORLD</p>' +
        '</body>'

      read({
        html: article,
        forceDecode: true
      }, function (err, art) {
        should.not.exist(err)
        art.content.should.not.contain('&quot')
        done()
      })
    })
  })
})

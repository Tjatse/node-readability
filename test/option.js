var read = require('../'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

var uri, html, charset;

describe('different options', function() {
  before(function() {
    uri = 'http://www.bing.com';
    html = '<p>Hello, node-art</p>';
    charset = 'utf8';
  });
  after(function() {
    uri = null;
    html = null;
    charset = null;
  });
  describe('have three arguments', function() {
    it('should detect two options', function(done) {
      read(uri, {
        charset: charset
      }, function(err, art, options, resp) {
        should.not.exist(err);
        options.uri.should.be.equal(uri);
        options.charset.should.be.equal(charset);
        resp.statusCode.should.be.equal(200)
        done();
      });
    });
  });

  describe('have two arguments(string, function)', function() {
    it('should detect one options', function(done) {
      read(uri, function(err, art, options) {
        should.not.exist(err);
        options.uri.should.be.equal(uri);
        should.not.exist(options.charset);
        done();
      });
    });
  });

  describe('have two arguments(object, function)', function() {
    it('should detect two options', function(done) {
      read({
        uri: uri,
        charset: charset
      }, function(err, art, options) {
        should.not.exist(err);
        options.uri.should.be.equal(uri);
        options.charset.should.be.equal(charset);
        done();
      });
    });
  });

  describe('uri is passed in', function() {
    it('should detect uri in options', function(done) {
      read({
        uri: uri,
        charset: charset
      }, function(err, art, options) {
        should.not.exist(err);
        options.uri.should.be.equal(uri);
        done();
      });
    });
  });

  describe('uri is passed in, but treat as html', function() {
    it('should detect html automatically', function(done) {
      read({
        uri: html,
        charset: charset
      }, function(err, art, options) {
        should.not.exist(err);
        options.html.should.be.equal(html);
        done();
      });
    });
  });

  describe('html is passed in', function() {
    it('should detect html in options', function(done) {
      read({
        uri: html,
        charset: charset
      }, function(err, art, options) {
        should.not.exist(err);
        options.html.should.be.equal(html);
        done();
      });
    });
  });
});

describe('minParagraphs option', function() {
  before(function() {
    html = '<title>read-art</title><body><div><div><p>hi, dude, i am <a href="/Tjatse/read-art.git">readability</a>, aka read-art...</p></div><span>footer</span></div></body>'
  });
  describe('3 by default', function() {
    it('should find footer', function(done) {
      read({
        minTextLength: 0,
        html: html
      }, function(err, art, options, resp) {
        should.not.exist(err);
        art.content.should.contain('footer');
        done();
      });
    });
  });
  describe('0 by customized', function() {
    it('should find no footer', function(done) {
      read({
        minTextLength: 0,
        minParagraphs: 0,
        html: html
      }, function(err, art, options, resp) {
        should.not.exist(err);
        art.content.should.not.contain('footer');
        done();
      });
    });
  });

  describe('forceDecode', function() {
    it('false, by cheerio', function(done) {
      var article = '<title>title</title>' +
        '<body>' +
        '<p foo="&quot; width=1000 onclick=alert(10) test"> HELLO WORLD</p>' +
        '</body>';

      read({
        html: article
      }, function(err, art) {
        should.not.exist(err);
        art.content.should.contain('&quot')
        done();
      });
    });

    it('true, by entities', function(done) {
      var article = '<title>title</title>' +
        '<body>' +
        '<p foo="&quot; width=1000 onclick=alert(10) test"> HELLO WORLD</p>' +
        '</body>';

      read({
        html: article,
        forceDecode: true
      }, function(err, art) {
        should.not.exist(err);
        art.content.should.not.contain('&quot')
        done();
      });
    });
  });

  describe('betterTitle', function() {
    it('by default', function(done) {
      var article = '<title>ZTE seals sponsorship deal with Spanish football club</title>' +
        '<body>' +
        '<p> HELLO WORLD</p>' +
        '</body>';

      read({
        html: article
      }, function(err, art) {
        should.not.exist(err);
        art.title.should.not.contain('football club')
        done();
      });
    });

    it('minLength', function(done) {
      var article = '<title>ZTE seals sponsorship deal with Spanish football club</title>' +
        '<body>' +
        '<p> HELLO WORLD</p>' +
        '</body>';

      read({
        html: article,
        betterTitle: 1000
      }, function(err, art) {
        should.not.exist(err);
        console.log(art.title)
        art.title.should.contain('football club');
        done();
      });
    });

    it('fn', function(done) {
      var article = '<title>ZTE seals sponsorship deal with Spanish football club</title>' +
        '<body>' +
        '<p> HELLO WORLD</p>' +
        '</body>';

      read({
        html: article,
        betterTitle: function(t){
          return '[China Daily]' + t;
        }
      }, function(err, art) {
        should.not.exist(err);
        console.log(art.title)
        art.title.should.contain('football club');
        art.title.should.contain('China Daily');
        done();
      });
    });
  });
});

var read = require('../'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

describe('fix links',function(){

  describe('should fixes nothing',function(){
    it('if uri not provided',function(done){
      read('<title>read-art</title><body><div><p>hi, dude, i am <a href="/Tjatse/read-art.git">readability</a>, aka read-art...</p></div></body>', function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain('<a href="/Tjatse/read-art.git">');
        art.title.should.equal('read-art');
        done();
      });
    });
  });

  describe('should works fine',function(){
    it('if uri provides',function(done){
      read({
        uri: 'http://github.com/Tjatse',
        html: '<title>read-art</title><body><div><p>hi, dude, i am <a href="/Tjatse/read-art.git">readability</a>, aka read-art...</p></div></body>'
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain('<a href="http://github.com/Tjatse/read-art.git">');
        art.title.should.equal('read-art');
        done();
      });
    });
  });

  describe('image fallback option',function(){
    it('fallback to relative data-src if imgFallback option is true',function(done){
      read({
        uri: 'http://github.com/Tjatse',
        html: '<title>read-art</title><body><div><p>hi, dude, i am <img data-src="/Tjatse/foo.png" />, aka read-art...</p></div></body>',
        imgFallback: true,
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain(' src="http://github.com/Tjatse/foo.png"');
        art.title.should.equal('read-art');
        done();
      });
    });

    it('fallback to absolute data-src if imgFallback option is true',function(done){
      read({
        uri: 'http://github.com/Tjatse',
        html: '<title>read-art</title><body><div><p>hi, dude, i am <img data-src="http://github.com/Tjatse/foo.png" />, aka read-art...</p></div></body>',
        imgFallback: true,
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain(' src="http://github.com/Tjatse/foo.png"');
        art.title.should.equal('read-art');
        done();
      });
    });

    it('not fallback to data-src if imgFallback option is false',function(done){
      read({
        uri: 'http://github.com/Tjatse',
        html: '<title>read-art</title><body><div><p>hi, dude, i am <img data-src="/Tjatse/foo.png" />, aka read-art...</p></div></body>',
        imgFallback: false,
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.not.contain('<img');
        art.title.should.equal('read-art');
        done();
      });
    });
  });
});
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
    describe('as boolean', function() {
      describe('true', function() {
        it('fallback to relative data-src if imgFallback option is true',function(done){
          read({
            uri: 'http://github.com/Tjatse',
            html: '<title>read-art</title><body><div><p>hi, dude, i am <img data-src="/path/to/foo.png" />, aka read-art...</p></div></body>',
            imgFallback: true
          }, function(err, art){
            should.not.exist(err);
            expect(art).to.be.an('object');
            art.content.should.contain(' src="http://github.com/path/to/foo.png"');
            art.title.should.equal('read-art');
            done();
          });
        });

        it('fallback to absolute data-src if imgFallback option is true',function(done){
          read({
            uri: 'http://example.com/',
            html: '<title>read-art</title><body><div><p>hi, dude, i am <img data-src="http://github.com/path/to/foo.png" />, aka read-art...</p></div></body>',
            imgFallback: true
          }, function(err, art){
            should.not.exist(err);
            expect(art).to.be.an('object');
            art.content.should.contain(' src="http://github.com/path/to/foo.png"');
            art.title.should.equal('read-art');
            done();
          });
        });

        it('not fallback to data-src if imgFallback option is true and src exists',function(done){
          read({
            uri: 'http://github.com/Tjatse',
            html: '<title>read-art</title><body><div><p>hi, dude, i am <img data-src="/path/to/foo.png" src="/path/to/bar.png" />, aka read-art...</p></div></body>',
            imgFallback: true
          }, function(err, art){
            should.not.exist(err);
            expect(art).to.be.an('object');
            art.content.should.contain(' src="http://github.com/path/to/bar.png"');
            art.content.should.not.contain(' src="http://github.com/path/to/foo.png"');
            art.title.should.equal('read-art');
            done();
          });
        });
      });

      describe('false', function() {
        it('remove node if fallback does not work and neither src',function(done){
          read({
            uri: 'http://github.com/Tjatse',
            html: '<title>read-art</title><body><div><p>hi, dude, i am <img data-src="/path/to/foo.png" />, aka read-art...</p></div></body>',
            imgFallback: false
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

    describe('as string', function() {
      it('fallback to imgFallback attr (data-*)',function(done){
        read({
          uri: 'http://github.com/Tjatse',
          html: '<title>read-art</title><body><div><p>hi, dude, i am <img data-foo="/path/to/foo.png" />, aka read-art...</p></div></body>',
          imgFallback: 'data-foo'
        }, function(err, art){
          should.not.exist(err);
          expect(art).to.be.an('object');
          art.content.should.contain(' src="http://github.com/path/to/foo.png"');
          art.title.should.equal('read-art');
          done();
        });
      });
      it('fallback to imgFallback attr !(data-*)',function(done){
        read({
          uri: 'http://github.com/Tjatse',
          html: '<title>read-art</title><body><div><p>hi, dude, i am <img foo-bar="/path/to/foo.png" />, aka read-art...</p></div></body>',
          imgFallback: 'foo-bar'
        }, function(err, art){
          should.not.exist(err);
          expect(art).to.be.an('object');
          art.content.should.contain(' src="http://github.com/path/to/foo.png"');
          art.title.should.equal('read-art');
          done();
        });
      });
      it('not fallback to imgFallback attr if src exists',function(done){
        read({
          uri: 'http://github.com/Tjatse',
          html: '<title>read-art</title><body><div><p>hi, dude, i am <img foo-bar="/path/to/foo.png" src="/path/to/bar.png" />, aka read-art...</p></div></body>',
          imgFallback: 'foo-bar'
        }, function(err, art){
          should.not.exist(err);
          expect(art).to.be.an('object');
          art.content.should.contain(' src="http://github.com/path/to/bar.png"');
          art.content.should.not.contain(' src="http://github.com/path/to/foo.png"');
          art.title.should.equal('read-art');
          done();
        });
      });
      it('remove node if fallback does not work and neither src',function(done){
        read({
          uri: 'http://github.com/Tjatse',
          html: '<title>read-art</title><body><div><p>hi, dude, i am <img data-src="/path/to/foo.png" />, aka read-art...</p></div></body>',
          imgFallback: 'data-src1'
        }, function(err, art){
          should.not.exist(err);
          expect(art).to.be.an('object');
          art.content.should.not.contain('<img');
          art.title.should.equal('read-art');
          done();
        });
      });
    });
    describe('as function', function () {
      it('fallback to imgFallback result attr', function(done) {
        read({
          uri: 'http://github.com/Tjatse',
          html: '<title>read-art</title><body><div><p>hi, dude, i am <img data-image-dir="/path/to/" thumbnail="foo.png" />, aka read-art...</p></div></body>',
          imgFallback: function (node) {
            arguments.should.have.length(2);
            return node.data('image-dir') + node.attr('thumbnail');
          }
        }, function(err, art){
          should.not.exist(err);
          expect(art).to.be.an('object');
          art.content.should.contain(' src="http://github.com/path/to/foo.png"');
          art.title.should.equal('read-art');
          done();
        });
      });
      it('fallback to imgFallback result attr', function(done) {
        read({
          uri: 'http://github.com/Tjatse',
          html: '<title>read-art</title><body><div><p>hi, dude, i am <img data-image-dir="/path/to/" thumbnail="foo.png" />, aka read-art...</p></div></body>',
          imgFallback: function (node) {
            arguments.should.have.length(2);
            return node.data('image-dir') + node.attr('thumbnail');
          }
        }, function(err, art){
          should.not.exist(err);
          expect(art).to.be.an('object');
          art.content.should.contain(' src="http://github.com/path/to/foo.png"');
          art.title.should.equal('read-art');
          done();
        });
      });
      it('not fallback to imgFallback result attr if src exists', function(done) {
        read({
          uri: 'http://github.com/Tjatse',
          html: '<title>read-art</title><body><div><p>hi, dude, i am <img data-image-dir="/path/to/" thumbnail="foo.png" src="/path/to/bar.png" />, aka read-art...</p></div></body>',
          imgFallback: function (node, src) {
            arguments.should.have.length(2);
            if (!src) {
              return node.data('image-dir') + node.attr('thumbnail');
            }
          },
        }, function(err, art){
          should.not.exist(err);
          expect(art).to.be.an('object');
          art.content.should.contain(' src="http://github.com/path/to/bar.png"');
          art.content.should.not.contain(' src="http://github.com/path/to/foo.png"');
          art.title.should.equal('read-art');
          done();
        });
      });
      it('fallback to imgFallback result attr if src exists', function(done) {
        read({
          uri: 'http://github.com/Tjatse',
          html: '<title>read-art</title><body><div><p>hi, dude, i am <img data-image-dir="/path/to/" thumbnail="foo.png" src="/path/to/bar.png" />, aka read-art...</p></div></body>',
          imgFallback: function (node, src) {
            arguments.should.have.length(2);
            return node.data('image-dir') + node.attr('thumbnail');
          }
        }, function(err, art){
          should.not.exist(err);
          expect(art).to.be.an('object');
          art.content.should.contain(' src="http://github.com/path/to/foo.png"');
          art.content.should.not.contain(' src="http://github.com/path/to/bar.png"');
          art.title.should.equal('read-art');
          done();
        });
      });
      it('remove node if fallback does not work and neither src',function(done){
        read({
          uri: 'http://github.com/Tjatse',
          html: '<title>read-art</title><body><div><p>hi, dude, i am <img data-src="/path/to/foo.png" />, aka read-art...</p></div></body>',
          imgFallback: function (node) {
            arguments.should.have.length(2);
          }
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
});

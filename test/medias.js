var read = require('../'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

describe('medias',function(){

  describe('read html with text and images',function(){
    it('should have image and text',function(done){
      read('<title>read-art</title><body><div><div><img src="test1.jpg" /><img src="test2.jpg" /></div><p>hi, dude, i am readability, aka read-art...</p></div></body>', function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain('<img src="test1.jpg"><img src="test2.jpg">');
        art.content.should.contain('hi, dude, i am readability, aka read-art...');
        art.title.should.equal('read-art');
        done();
      });
    });
  });

  describe('read html with images',function(){
    it('should have images',function(done){
      read('<title>read-art</title><body><div><div><img src="test1.jpg" /><img src="test2.jpg" /></div></body>', function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain('<img src="test1.jpg"><img src="test2.jpg">');
        art.title.should.equal('read-art');
        done();
      });
    });
  });

});
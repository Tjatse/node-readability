var read = require('../'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

describe('output',function(){

  describe('dataType is text',function(){
    it.skip('should have no tag',function(done){
      read('<title>read-art</title><body><div><div><img src="test1.jpg" /><img src="test2.jpg" /></div><p>hi, dude, i am readability, aka read-art...</p></div></body>', {
        dataType: 'text'
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.not.contain('<');
        art.title.should.equal('read-art');
        done();
      });
    });
  });
  describe('dataType is html',function(){
    it.skip('should have tag',function(done){
      read('<title>read-art</title><body><div><div><img src="test1.jpg" /><img src="test2.jpg" /></div><p>hi, dude, i am readability, aka read-art...</p></div></body>', {
        dataType: 'html'
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain('<');
        art.title.should.equal('read-art');
        done();
      });
    });
  });

  describe('dataType is json',function(){
    it('should be an Array',function(done){
      read('<title>read-art</title><body><div><div><img src="test1.jpg" /><img src="test2.jpg" /></div><p>hi, dude, i am readability, aka read-art...</p></div></body>', {
        dataType: 'json'
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        expect(art.content).to.be.an('array');
        expect(art.content).to.be.length(3);
        art.title.should.equal('read-art');
        done();
      });
    });
  });
});
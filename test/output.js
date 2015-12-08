var read = require('../'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

describe('output',function(){

  describe('output is text',function(){
    it('should have no tag',function(done){
      read('<title>read-art</title><body><div><div><img src="test1.jpg" /><img src="test2.jpg" /></div><p>hi, dude, i am readability, aka read-art...</p></div></body>', {
        output: 'text'
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.not.contain('<');
        art.title.should.equal('read-art');
        done();
      });
    });
  });
  describe('output is html',function(){
    it('should have tag',function(done){
      read('<title>read-art</title><body><div><div><img src="test1.jpg" /><img src="test2.jpg" /></div><p>hi, dude, i am readability, aka read-art...</p></div></body>', {
        output: 'html'
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain('<');
        art.title.should.equal('read-art');
        done();
      });
    });
  });

  describe('output is json',function(){
    it('should be an Array',function(done){
      read('<title>read-art</title><body><div><div><img src="test1.jpg" /><img src="test2.jpg" /></div><p>hi, dude, i am readability, aka read-art...</p></div></body>', {
        output: 'json'
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

  describe('output is json and do not break it down',function(){
    it('should be an Array (length equals 1)',function(done){
      read('<title>read-art</title><body><div><div></div><p><span>hi, dude,</span><br style=""/><span>i am readability, aka read-art...</span></p></div></body>', {
        output: 'json'
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        expect(art.content).to.be.an('array');
        expect(art.content).to.be.length(1);
        art.title.should.equal('read-art');
        done();
      });
    });
  });

  describe('output is json and break it down',function(){
    it('should be an Array (length equals 2)',function(done){
      read('<title>read-art</title><body><div><div></div><p><span>hi, dude,</span><br style=""/><span>i am readability, aka read-art...</span></p></div></body>', {
        output: {
          type: 'json',
          break: true
        }
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        expect(art.content).to.be.an('array');
        expect(art.content).to.be.length(2);
        art.title.should.equal('read-art');
        done();
      });
    });
  });

  describe('output as node',function(){
    it('should behave like cheerio object', function(done){
      read('<title>read-art</title><body><div><div></div><p><span>hi, dude,</span><br style=""/><span>i am readability, aka read-art...</span></p></div></body>', {
        output: {
          type: 'cheerio',
        }
      }, function(err, art){
        var dom;
        should.not.exist(err);
        expect(art).to.be.an('object');
        dom = art.content;
        expect(art.content).to.be.an('object');
        expect(dom.find('p').length).to.equal(1);
        expect(dom.find('span').length).to.equal(2);
        done();
      });
    });
  });
});

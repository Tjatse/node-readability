var read = require('../'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

describe('html passing',function(){

  describe('instead of uri(English)',function(){
    it('should have title & body',function(done){
      read('<title>read-art</title><body><div><p>hi, dude, i am readability, aka read-art...</p></div></body>', function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain('hi, dude, i am readability, aka read-art...');
        art.title.should.equal('read-art');
        done();
      });
    });
  });

  describe('instead of uri(Chinese)',function(){
    it('should have title & body',function(done){
      read('<title>文章抓取</title><body><div><p>你好，很高兴认识你，我是正文，字数一定要凑到25个以上哦，不然被抛弃了。。</p></div></body>', function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain('你好，很高兴认识你，我是正文');
        art.title.should.equal('文章抓取');
        done();
      });
    });
  });

});
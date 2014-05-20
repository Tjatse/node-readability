var read = require('../'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

describe('find exact title',function(){

  describe('length less than 10 before separator',function(){
    it('should remove separator',function(done){
      read('<title>The | whole title including separator</title>', function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.title.should.equal('The whole title including separator');
        done();
      });
    });
  });

  ['|', '-', '_', '«', '»'].forEach(function(s){
    describe('better title',function(){
      it('split with ' + s,function(done){
        read('<title>Chapter of readability ' + s + ' Tjatse</title>', function(err, art){
          should.not.exist(err);
          expect(art).to.be.an('object');
          art.title.should.equal('Chapter of readability');
          done();
        });
      });
    });
  });

  describe('title split with multi separators',function(){
    it('should returns the first found length greater than 10',function(done){
      read('<title>Chapter | Demonstration of readability - Tjatse</title>', function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.title.should.equal('Chapter Demonstration of readability');
        done();
      });
    });
  });

  describe('better title',function(){
    it('should return the first found',function(done){
      read('<title>Chapter Demonstration of readability_Node.js_readability_GitHub</title>', function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.title.should.equal('Chapter Demonstration of readability');
        done();
      });
    });
  });

});
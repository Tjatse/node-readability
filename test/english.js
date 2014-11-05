var read = require('../'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

describe('English sites',function(){

  describe('theatlantic.com',function(){
    it('should have title & content',function(done){
      read('http://www.theatlantic.com/international/archive/2014/05/the-last-man-at-nuremberg/361968/', function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain('Benjamin Ferencz was 27 when the');
        art.title.should.equal('The Last Man at Nuremberg');
        done();
      });
    });
  });

  describe('cnn.com',function(){
    it('should have title & content',function(done){
      read('http://amanpour.blogs.cnn.com/2014/05/08/defector-shadowy-organization-not-kim-jong-un-controls-north-korea/?hpt=hp_c1', function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain('The erosion of control will set North Korea free, not engagement with the regime.');
        art.title.should.equal('Defector: Shadowy organization, not Kim Jong Un, controls North Korea');
        done();
      });
    });
  });

});
var read = require('../'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

describe('Issues on Github',function(){

  describe('@mxr576',function(){
    it('1. should have title & content',function(done){
      read({
        uri: 'http://rss.feedsportal.com/c/33832/f/610117/p/1/s/64865903/sc/3/l/0L0Slongfordleader0Bie0Clife0Etimes0Eclassic0Eirish0Edesign0Ereimagined0Ein0Estyle0E10E6965490A/story01.htm',
        timeout: 15000
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        should.exist(art.content);
        should.exist(art.title);
        done();
      });
    });

    it('2. should have title & content',function(done){
      read({
        uri: 'http://smh.com.au/sport/cycling/australian-cyclist-rory-sutherland-pulls-out-of-world-titles-20150920-gjqzur.html',
        timeout: 15000
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        should.exist(art.content);
        should.exist(art.title);
        done();
      });
    });
  });
});
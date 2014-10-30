var read = require('../'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

describe('gbk encoding sites',function(){
  describe('override charset to avoid messy codes',function(){
    it('should have title & content',function(done){
      read('http://game.163.com/14/0506/10/9RI8M9AO00314SDA.html', {
        charset: 'gbk'
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain('亲爱的冒险者们：');
        art.title.should.equal('《最终幻想14》1080P官方壁纸下载开放');
        done();
      });
    });
  });

  describe.skip('news.cnfol.com',function(){
    it('should have title & content',function(done){
      read('http://news.cnfol.com/zhengquanyaowen/20140509/17814941.shtml', function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain('上交所曾多次通过该账户所在的营业部对账户所有人进行过口头警示');
        art.title.should.equal('债券交易严重异常 姚某某证券账户被上交所限制交易3个月');
        done();
      });
    });
  });

  describe.skip('biz.xinmin.cn',function(){
    it('should have title & content',function(done){
      read('http://biz.xinmin.cn/2014/05/09/24267182.html', function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain('靖江市官方微博“靖江发布”当日通报：“今天上午10时左右，');
        art.title.should.equal('长江水质异常致江苏靖江停水 当地抢购矿泉水');
        done();
      });
    });
  });

  describe.skip('www.yicai.com',function(){
    it('should have title & content',function(done){
      read('http://www.yicai.com/news/2014/05/3793493.html', function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain('靖江市华汇供水有限公司总经理陆汝光告诉《第一财经日报》记者');
        art.title.should.equal('江苏靖江因水质异常停水 21万家庭受影响');
        done();
      });
    });
  });

});
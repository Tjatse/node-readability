var read   = require('../'),
    chai   = require('chai'),
    expect = chai.expect,
    should = chai.should();

var uri, html;
describe('extract content', function(){
  before(function(){
    uri = 'http://stackoverflow.com/questions/21126385/a-sh-line-that-scares-me-is-it-portable/21127377#21127377';
    html = '';
  });
  after(function(){
    uri = null;
    html = null;
  });
  describe('while minTextLength set to 1000', function(){
    it('should works unexpected', function(done){
      read(uri, {
        timeout      : 15000,
        output       : 'text',
        minTextLength: 1000
      }, function(err, art){
        html = art.html;
        should.not.exist(err);
        expect(art).to.be.an('object');
        expect(art.content).to.match(/^Stack Overflow/);
        setTimeout(done, 1000);
      });
    });
  });

  describe('while minTextLength set to 0 and without score rules', function(){
    it('should works unexpected', function(done){
      read(html, {
        output       : 'text',
        minTextLength: 0
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        expect(art.content).to.match(/^Let\'s/);
        setTimeout(done, 1000);
      });
    });
  });

  describe('while minTextLength is setting to 0 and custom score rules', function(){
    it('should works fine', function(done){
      read(html, {
        output       : 'text',
        minTextLength: 0,
        scoreRule    : function(node){
          if (node.parent().parent().hasClass('postcell')) {
            return 100;
          }
          return 0;
        }
      }, function(err, art){
        should.not.exist(err);
        expect(art).to.be.an('object');
        expect(art.content).to.match(/^I\'m currently working on pm2/);
        setTimeout(done, 1000);
      });
    });
  });

});
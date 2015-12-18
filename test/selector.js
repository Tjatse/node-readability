var read = require('../'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

describe('custom selectors',function(){

  describe('should override default title and content selector',function(){
    it('if provided',function(done){
      read({
        html: '<title>read-art</title><body><div class="article"><h3>Who Am I</h3><p class="section1">hi, dude, i am readability</p><p class="section2">aka read-art...</p><small class="author" data-author="Tjatse X">Tjatse</small></div></body>',
        selectors: {
          title: {
            selector: '.article>h3',
            extract: ['text', 'title']
          },
          content: '.article>p:nth-child(1)',
          author: {
            selector: '.article>small.author',
            extract: {
              shot_name: 'text',
              full_name: 'data-author'
            }
          }
        }
      }, function (err, art) {
        should.not.exist(err);
        expect(art).to.be.an('object');
        art.content.should.contain('<a href="/Tjatse/read-art.git">');
        art.title.should.equal('read-art');
        done();
      });
    });
  });

});
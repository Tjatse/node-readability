var read = require('../')
var chai = require('chai')
var expect = chai.expect
var should = chai.should()

describe('custom selectors', function () {
  var html = '<title>read-art</title><body><div class="article"><h3 title="--read-art--">Who Am I<script>?</script></h3><p class="section1">hi, dude, i am <b>readability</b></p><p class="section2">aka read-art...</p><small class="author" data-author="Tjatse X">Tjatse<b>_</b></small></div></body>'
  it('should works fine', function (done) {
    read({
      html: html,
      selectors: {
        title: {
          selector: '.article>h3',
          skipTags: false,
          extract: ['text', 'title']
        },
        content: '.article p.section1',
        author: {
          selector: '.article>small.author',
          skipTags: 'b',
          extract: {
            shot_name: 'text',
            full_name: 'data-author',
            custom_name: function (node, options) {
              return 'read-art:' + node.data('author')
            },
            noreturn_name: function () {}
          }
        },
        source: {
          selector: '.article>h3',
          extract: function (node, options) {
            return '[' + node.attr('title') + ']' + node.text()
          }
        }
      }
    }, function (err, art) {
      should.not.exist(err)
      expect(art).to.be.an('object')
      expect(art.title).to.be.an('object')
      art.title.title.should.equal('--read-art--')
      art.title.text.should.equal('Who Am I?')
      art.content.should.not.contain('aka read-art')
      expect(art.author).to.be.an('object')
      art.author.shot_name.should.equal('Tjatse')
      art.author.full_name.should.equal('Tjatse X')
      art.author.custom_name.should.equal('read-art:Tjatse X')
      art.source.should.equal('[--read-art--]Who Am I')
      should.not.exist(art.author.noreturn_name)
      done()
    })
  })
})

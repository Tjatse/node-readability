var read = require('../')
var chai = require('chai')
var expect = chai.expect
var should = chai.should()

describe('grab content', function () {
  describe('by requesting url', function () {
    it('should without related links and useless anchors', function (done) {
      read({
        uri: 'http://www.cq.xinhuanet.com/2016-03/28/c_1118467794.htm',
        output: 'text'
      }, function (err, art) {
        should.not.exist(err)
        expect(art).to.be.an('object')
        art.content.should.not.contains('打印')
        art.content.should.not.contains('下一页')
        art.content.should.not.contains('评论')
        art.content.should.not.contains('信箱')
        art.content.should.not.contains('推荐')
        done()
      })
    })
  })
})

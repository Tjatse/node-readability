var read = require('../')
var chai = require('chai')
var expect = chai.expect
var should = chai.should()

describe('Issues on Github', function () {
  describe.skip('@mxr576', function () {
    it('1. should have title & content', function (done) {
      read({
        uri: 'http://rss.feedsportal.com/c/33832/f/610117/p/1/s/64865903/sc/3/l/0L0Slongfordleader0Bie0Clife0Etimes0Eclassic0Eirish0Edesign0Ereimagined0Ein0Estyle0E10E6965490A/story01.htm',
        timeout: 15000
      }, function (err, art) {
        should.not.exist(err)
        expect(art).to.be.an('object')
        should.exist(art.content)
        should.exist(art.title)
        done()
      })
    })

    it('2. should have title & content', function (done) {
      read({
        uri: 'http://smh.com.au/sport/cycling/australian-cyclist-rory-sutherland-pulls-out-of-world-titles-20150920-gjqzur.html',
        timeout: 15000
      }, function (err, art) {
        should.not.exist(err)
        expect(art).to.be.an('object')
        should.exist(art.content)
        should.exist(art.title)
        done()
      })
    })
  })

  describe('@entertainyou', function () {
    it('should handle pages with images as article', function (done) {
      read({
        uri: 'http://mp.weixin.qq.com/s?__biz=MjYyMzc1Mjk4MA==&mid=400815255&idx=1&sn=d91b630394b8ba70209406bbf44b41e8&scene=0#wechat_redirect',
        // the class of #js_content.rich_media_content (`media`)
        // matches the `negative` regexp of read-art reader
        // simply avoid being removed by defining the CSS selectors
        selectors: {
          content: '#js_content'
        },
        imgFallback: function (node) {
          return node.data('src') + '.jpg'
        },
        scoreImg: true
      }, function (err, art) {
        should.not.exist(err)
        var content = art.content
        // somewhat weak validation
        expect(content).to.contain('data-ratio')
        expect(content).to.contain('')
        expect(content).to.match(/src=\".*\.jpg"/)
        done()
      })
    })

    it('should handle zhangzhishi.cc', function (done) {
      var URL = 'http://www.zhangzishi.cc/e3-80-90-e6-b6-a8-e5-a7-bf-e5-8a-bf-e7-a7-91-e6-99-ae-e7-b3-bb-e5-88-97-e3-80-91-e5-88-b0-e5-ba-95-e5-a6-82-e4-bd-95-e7-bb-99-e5-a5-b3-e4-ba-ba-e5-8f-a3-e4-ba-a4-ef-bc-8c-e7-b2-be.html'
      read(URL, function (err, art) {
        should.not.exist(err)
        var content = art.content
        expect(content).to.not.contain('相关推荐')
        done()
      })
    })
  })
})

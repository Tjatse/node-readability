var read = require('../')
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var expect = chai.expect
var should = chai.should()

if (typeof Promise !== 'undefined') {
  describe('Promise', function () {
    var html = '<body><p>Hello, node-art</p></body>'
    describe('chaining', function () {
      it('works fine', function (done) {
        var callOnce = function (err) {
          var called = false
          if (!called) {
            done(err)
            called = true
          }
        }
        read(html)
          .then(function (art) {
            should.not.exist(art.serverResponse)
            expect(art).to.be.an('object')
            should.exist(art.options)
            expect(html).to.contains(art.content)
            callOnce()
          }, callOnce)
          .catch(callOnce)
      })
      it('catch Error', function (done) {
        var callOnce = function (err) {
          var called = false
          if (!called) {
            done(err)
            called = true
          }
        }
        read()
          .then(function (art) {
            callOnce(new Error('should not going further'))
          }, function (err) {
            should.exist(err)
            expect(err).to.be.an('error')
            callOnce()
          })
          .catch(function (err) {
            should.exist(err)
            expect(err).to.be.an('error')
            callOnce()
          })
      })
    })
  })
}

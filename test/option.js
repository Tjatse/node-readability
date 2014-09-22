
var read = require('../'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

var uri = 'http://github.com',
  html = '<p>Hello, node-art</p>',
  charset = 'utf8';

describe('different options',function(){

  describe('have three arguments',function(){
    it('should detect two options',function(){
      read(uri, { overrideCharset: charset }, function(err, art, options){
        should.not.exist(err);
        options.uri.should.be.equal(uri);
        options.overrideCharset.should.be.equal(charset);
      });
    });
  });

  describe('have two arguments(string, function)',function(){
    it('should detect one options',function(){
      read(uri, function(err, art, options){
        should.not.exist(err);
        options.uri.should.be.equal(uri);
        should.not.exist(options.overrideCharset);
      });
    });
  });

  describe('have two arguments(object, function)',function(){
    it('should detect two options',function(){
      read({ uri: uri, overrideCharset: charset }, function(err, art, options){
        should.not.exist(err);
        options.uri.should.be.equal(uri);
        options.overrideCharset.should.be.equal(charset);
      });
    });
  });

  describe('uri is passed in',function(){
    it('should detect uri in options',function(){
      read({ uri: uri, overrideCharset: charset }, function(err, art, options){
        should.not.exist(err);
        options.uri.should.be.equal(uri);
      });
    });
  });

  describe('uri is passed in, but treat as html',function(){
    it('should detect html automatically',function(){
      read({ uri: html, overrideCharset: charset }, function(err, art, options){
        should.not.exist(err);
        options.html.should.be.equal(html);
      });
    });
  });

  describe('html is passed in',function(){
    it('should detect html in options',function(){
      read({ uri: html, overrideCharset: charset }, function(err, art, options){
        should.not.exist(err);
        options.html.should.be.equal(html);
      });
    });
  });
});
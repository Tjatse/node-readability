'use strict'

var req = require('req-fast')
var cheerio = require('cheerio')
var util = require('util')
var debug = require('debug')('read-art.main')
var Article = require('./lib/article')

module.exports = read

/**
 * Read article from page.
 * @param uri uri or html
 * @param options reference to https://github.com/Tjatse/node-readability#options
 * @param callback callback, have two arguments been passed:
 * 1: error
 * 2: article
 */
function read () {
  return handle.apply(null, arguments) // eslint-disable-line no-useless-call
}

/**
 * Custom settings.
 * @type {readArt.use}
 */
read.use = Article.use

function handle (uri, options, callback) {
  if (arguments.length === 0) {
    return new Error('Incorrect arguments.')
  }
  // organize parameters
  if ((typeof options === 'function') && !callback) {
    callback = options
  }
  if (options && typeof options === 'object') {
    options.uri = uri
  } else if (typeof uri === 'string' || isCheerio(uri)) {
    options = { uri: uri }
  } else {
    options = uri
  }

  if (typeof options !== 'object') {
    return new Error('options are required!')
  }

  uri = options.cheerio || options.html || options.uri

  if ((typeof uri !== 'string' && !isCheerio(uri)) || !uri) {
    return new Error('only accept cheerio, url or HTML as article content.')
  }

  options = util._extend({
    killBreaks: true,
    lowerCaseTags: true,
    output: 'html',
    minTextLength: 25,
    thresholdLinkDensity: 0.25,
    minParagraphs: 3,
    scoreImg: false
  }, options)

  var density = options.thresholdLinkDensity
  // fixed boolean
  if (!isNaN(density)) {
    density = parseFloat(density)
  }
  if (isNaN(density) || (density > 1 || density < 0)) {
    density = 0.25
  }
  options.thresholdLinkDensity = density

  if (isNaN(options.minParagraphs)) {
    options.minParagraphs = 3
  }
  if (typeof callback !== 'function') {
    callback = false
  }
  // indicating whether uri is a cheerio object or not.
  if (typeof uri !== 'string') {
    if (isCheerio(uri)) {
      if (!isHtml(options.html)) {
        delete options.html
      }
      if (isHtml(options.uri)) {
        if (!options.html) {
          options.html = options.uri
        }
        delete options.uri
      }
      options.cheerio = uri
      return parse({
        cheerio: uri,
        options: options,
        callback: callback
      })
    }
    var err = new Error('only accept cheerio, url or HTML as article content.')
    return callback ? callback(err) : err
  }
  // indicating uri is html or url.
  if (isHtml(uri) && options.uri && !options.html) {
    options.html = uri
    if (isHtml(options.uri)) {
      delete options.uri
    }
  }

  var parsingData = {
    uri: options.uri,
    html: options.html,
    options: options,
    callback: callback
  }
  // fetch body or straight convert to article.
  if (options.uri && !options.html) {
    debug('   requesting URL')
    req(options, function (err, resp) {
      debug('   ∟ got response')
      if (err || !resp) {
        if (debug.enabled) {
          debug('     ∟ Error: ' + (err ? err.message : 'no response'))
        }
        return callback && callback(err || new Error('Response is empty.'))
      }
      if (!resp.body) {
        var errMsg = 'No body was found, status code: ' + resp.statusCode
        debug('     ∟ Warning: ' + errMsg)
        return callback && callback(new Error(errMsg))
      }
      debug('     ∟ succeed')

      parsingData.html = resp.body.toString()
      delete resp.body
      parse(parsingData, resp)
    })
  } else {
    parse(parsingData)
  }
}

/**
 * Parse html to cheerio dom.
 * @param o options
 * @param e extra data
 * @return {String}
 */
function parse (o, e) {
  debug('   parsing...')
  if (!o.html && !o.cheerio) {
    var errMsg = 'Article content could not be found.'
    debug('   ∟ ' + errMsg)
    return o.callback && o.callback(new Error(errMsg))
  }
  if (o.html && o.options.killBreaks) {
    // replace <br />(blanks goes here) to <br />.
    o.html = o.html.replace(/<br[^\/>]*\/?>/ig, '<br />')
    // remove tab symbols like \r\t\n
    o.html = o.html.replace(/[\n\r\t]{2,}/gi, ' ')
  }

  o.callback && o.callback(null, new Article(o), o.options, e)
}

// from cheerio module.
var quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/
/**
 * Check if string is HTML
 * @param  {String}  str
 * @return {Boolean}
 */
function isHtml (str) {
  if (typeof str !== 'string') {
    return false
  }
  // Faster than running regex, if str starts with `<` and ends with `>`, assume it's HTML
  if (str.charAt(0) === '<' && str.charAt(str.length - 1) === '>' && str.length >= 3) {
    return true
  }

  // Run the regex
  var match = quickExpr.exec(str)
  return !!(match && match.length > 1)
}

/**
 * Check if object is an instance of Cheerio
 * @param  {Object}  o
 * @return {Boolean}
 */
function isCheerio (o) {
  return o && typeof o.root === 'function' && o.root() instanceof cheerio
}

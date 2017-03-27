'use strict'

var req = require('req-fast')
var util = require('util')
var debug = require('debug')('read-art.main')
var Article = require('./lib/article')
var Reader = require('./lib/reader')

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
  var args = arguments
  if ((args.length === 0 || typeof args[args.length - 1] !== 'function') && typeof Promise !== 'undefined') {
    debug('Promise')
    return new Promise(function (resolve, reject) {
      handle.apply({
        _promise: true,
        resolve: resolve,
        reject: reject
      }, args)
    })
  }
  debug('Normally handle')
  return handle.apply({
    _promise: false
  }, args)
}

/**
 * Custom settings.
 * @type {readArt.use}
 */
read.use = Article.use

// Simply Expose Article and Reader.
read.Article = Article
read.Reader = Reader

function handle (uri, options, callback) {
  var resolve
  var reject
  if (this._promise) {
    resolve = this.resolve
    reject = this.reject
  }
  if (arguments.length === 0) {
    return catchError('Incorrect arguments.', reject)
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
    return catchError('options are required!', reject)
  }

  uri = options.cheerio || options.html || options.uri

  if ((typeof uri !== 'string' && !isCheerio(uri)) || !uri) {
    return catchError('only accept cheerio, url or HTML as article content.', reject)
  }

  options = util._extend({
    killBreaks: true,
    lowerCaseTags: true,
    output: 'html',
    minTextLength: 25,
    thresholdLinkDensity: 0.25,
    minRelatedDensity: 0.8,
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

  if (typeof callback === 'function') {
    callback._not_promise = true
    reject = callback
    resolve = callback
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
        options: options
      }, null, resolve, reject)
    }
    return catchError('only accept cheerio, url or HTML as article content.', reject)
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
    options: options
  }
  // fetch body or straight convert to article.
  if (options.uri && !options.html) {
    debug('   requesting URL')
    return req(options, function (err, resp) {
      debug('   ∟ got response')
      if (err || !resp) {
        if (debug.enabled) {
          debug('     ∟ Error: ' + (err ? err.message : 'no response'))
        }
        return catchError(err || 'Response is empty.', reject)
      }
      if (!resp.body) {
        var errMsg = 'No body was found, status code: ' + resp.statusCode
        debug('     ∟ Warning: ' + errMsg)
        return catchError(errMsg, reject)
      }
      debug('     ∟ succeed')

      parsingData.html = resp.body.toString()
      delete resp.body
      parse(parsingData, resp, resolve, reject)
    })
  }
  parse(parsingData, null, resolve, reject)
}

/**
 * Parse html to cheerio dom.
 * @param  {Object} data
 * @param  {Object} resp
 * @param  {Function} resolve
 * @param  {Function} reject
 * @return {[Mixed]}
 */
function parse (data, resp, resolve, reject) {
  debug('   parsing...')
  if (!data.html && !data.cheerio) {
    var errMsg = 'Article content could not be found.'
    debug('   ∟ ' + errMsg)
    return catchError(errMsg, reject)
  }
  if (data.html && data.options.killBreaks) {
    // replace <br />(blanks goes here) to <br />.
    data.html = data.html.replace(/<br[^/>]*\/?>/ig, '<br />')
    // remove tab symbols like \r\t\n
    data.html = data.html.replace(/[\n\r\t]{2,}/gi, ' ')
  }
  if (resolve) {
    var opts = data.options
    var art = new Article(data)
    if (!resolve._not_promise) {
      if (resp) {
        art.serverResponse = resp
      }
      resolve(art)
    } else {
      resolve(null, art, opts, resp)
    }
  }
}

// from cheerio module.
var quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w-]*)$)/
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
  // a better way?
  return o && ['load', 'html', 'text', 'parseHTML', 'contains', 'root'].every(function (method) {
    return typeof o[method] === 'function'
  })
}

/**
 * Handle error
 * @param  {String|Error} err
 * @param  {Function} reject
 * @return {[Mixed]}
 */
function catchError (err, reject) {
  if (!(err instanceof Error)) {
    err = new Error(String(err))
  }
  return reject ? reject(err) : err
}

'use strict'

var req = require('req-fast')
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
function read (uri, options, callback) {
  // organize parameters
  if ((typeof options === 'function') && !callback) {
    callback = options
  }
  if (options && typeof options === 'object') {
    options.uri = uri
  } else if (typeof uri === 'string') {
    options = { uri: uri }
  } else {
    options = uri
    uri = options.uri || options.html
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
  if (!isFinite(density) || (density > 1 || density < 0)) {
    density = 0.25
  }
  options.thresholdLinkDensity = density

  if (!isFinite(options.minParagraphs)) {
    options.minParagraphs = 3
  }

  // indicating uri is html or url.
  var isHTML = uri.match(/^\s*</)
  if (isHTML && options.uri && !options.html) {
    options.html = options.uri
    delete options.uri
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
        return callback(err || new Error('Response is empty.'))
      }
      if (!resp.body) {
        var errMsg = 'No body was found, status code: ' + resp.statusCode
        debug('     ∟ Warning: ' + errMsg)
        return callback(new Error(errMsg))
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
 * Custom settings.
 * @type {readArt.use}
 */
read.use = Article.use

/**
 * Parse html to cheerio dom.
 * @param o options
 * @param e extra data
 * @return {String}
 */
function parse (o, e) {
  debug('   analyzing HTML')
  if (!o.html) {
    debug('   ∟ HTML content could not be found, simply returned')
    return ''
  }
  if (o.options.killBreaks) {
    // replace <br />(blanks goes here) to <br />.
    o.html = o.html.replace(/<br[^\/>]*\/?>/ig, '<br />')
    // remove tab symbols like \r\t\n
    o.html = o.html.replace(/[\n\r\t]{2,}/gi, ' ')
  }

  o.callback(null, new Article(o), o.options, e)
}

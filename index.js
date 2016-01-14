"use strict";

var req     = require('req-fast'),
    cheerio = require('cheerio'),
    util    = require('util'),
    Article = require('./lib/article');

module.exports = read;

/**
 * Read article from page.
 * @param uri uri or html
 * @param options reference to https://github.com/Tjatse/node-readability#options
 * @param callback callback, have two arguments been passed:
 * 1: error
 * 2: article
 */
function read(uri, options, callback){
  // organize parameters
  if ((typeof options === 'function') && !callback) {
    callback = options;
  }
  if (options && typeof options === 'object') {
    options.uri = uri;
  } else if (typeof uri === 'string') {
    options = {uri: uri};
  } else {
    options = uri;
    uri = options.uri || options.html;
  }

  options = util._extend({
    killBreaks: true,
    lowerCaseTags: true,
    output: 'html',
    minTextLength: 25,
    thresholdLinkDensity: 0.25,
    minParagraphs: 3
  }, options);

  var density = options.thresholdLinkDensity;
  if (!isFinite(density) || (density > 1 || density < 0)) {
    density = 0.25;
  }
  options.thresholdLinkDensity = density;

  if (!isFinite(options.minParagraphs)) {
    options.minParagraphs = 3;
  }

  // indicating uri is html or url.
  var isHTML = uri.match(/^\s*</);
  if (isHTML && options.uri && !options.html) {
    options.html = options.uri;
    delete options.uri;
  }

  var parsingData = {
    uri     : options.uri,
    html    : options.html,
    options : options,
    callback: callback
  };
  // fetch body or straight convert to article.
  if (options.uri && !options.html) {
    req(options, function(err, resp){
      if (err || !resp) {
        return callback(err || new Error('Response is empty.'));
      }
      if (!resp.body) {
        return callback(new Error('No body was found, status code: ' + resp.statusCode));
      }

      parsingData.html = resp.body.toString();
      delete resp.body;
      parse(parsingData, resp);
    });
  } else {
    parse(parsingData);
  }
}

/**
 * Custom settings.
 * @type {readArt.use}
 */
read.use = Article.use;

/**
 * Parse html to cheerio dom.
 * @param o options
 * @param e extra data
 * @return {String}
 */
function parse(o, e){
  if (!o.html) {
    return '';
  }
  if (o.options.killBreaks) {
    // replace <br />(blanks goes here) to <br />.
    o.html = o.html.replace(/<br[^\/>]*\/?>/ig, '<br />');
    // remove tab symbols like \r\t\n
    o.html = o.html.replace(/[\n\r\t]{2,}/gi, ' ');
  }

  var co = {decodeEntities: false};
  ['normalizeWhitespace', 'xmlMode', 'lowerCaseTags'].forEach(function(n){
    co[n] = !!o.options[n];
  });

  var $ = cheerio.load(o.html, co);
  o.callback(null, new Article($, o.options), o.options, e);
}
// Copyright 2014 Tjatse
// https://github.com/Tjatse/read-art
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

var req = require('req-fast'),
  cheerio = require('cheerio'),
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
  if ((typeof options === 'function') && !callback){
    callback = options;
  }
  if (options && typeof options === 'object') {
    options.uri = uri;
  } else if (typeof uri === 'string') {
    options = { uri: uri };
  } else {
    options = uri;
    uri = options.uri || options.html;
  }
  defineOption(options, 'killBreaks', true);
  defineOption(options, 'lowerCaseTags', true);
  defineOption(options, 'output', 'html');

  // indicating uri is html or url.
  var isHTML = uri.match(/^\s*</);
  if(isHTML && options.uri && !options.html){
    options.html = options.uri;
    delete options.uri;
  }

  var parsingData = {
    html: uri,
    options: options,
    callback: callback
  };
  // fetch body or straight convert to article.
  if (options.uri) {
    req(options, function(err, resp) {
      if (err || !resp) {
        return callback(err || new Error('Response is empty.'));
      }
      if(!resp.body){
        return callback(new Error('No body was found.'));
      }

      parsingData.html = resp.body.toString();
      parse(parsingData);
    });
  }else{
    parse(parsingData);
  }
}

/**
 * Parse html to cheerio dom.
 * @param o options
 * @return {String}
 */
function parse(o) {
  if (!o.html){
    return '';
  }
  if(o.options.killBreaks){
    // replace <br />(blanks goes here) to <br />.
    o.html = o.html.replace(/(<br\s*\/?>(\s|&nbsp;?)*){1,}/g,'<br />');
    // remove tab symbols like \r\t\n
    o.html = o.html.replace(/[\n\r\t]{2,}/gi, ' ');
  }

  var co = {decodeEntities: false};
  ['normalizeWhitespace', 'xmlMode', 'lowerCaseTags'].forEach(function(n){
    co[n] = !!o.options[n];
  });

  var $ = cheerio.load(o.html, co);
  o.callback(null, new Article($, o.options), o.options);
}

/**
 * Define property of object to default value.
 * @param options option object
 * @param k key
 * @param v value
 */
function defineOption(options, k, v){
  if(typeof options[k] == 'undefined'){
    options[k] = v;
  }
}
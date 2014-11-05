read-art [![NPM version](https://badge.fury.io/js/read-art.svg)](http://badge.fury.io/js/read-art) [![Build Status](https://travis-ci.org/Tjatse/node-readability.svg?branch=master)](https://travis-ci.org/Tjatse/node-readability)
=========
[![NPM](https://nodei.co/npm/read-art.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/read-art/)

1. Readability reference to Arc90's.
2. Scrape article from any page, automatically.
3. Make any web page readability, no matter Chinese or English,very useful for ElasticSearch data spider.

> *快速抓取网页文章标题和内容，适合node.js爬虫使用，服务于ElasticSearch。*

**NOTES: the property `dataType` was changed to `output`, sorry for that.**

## Features
- Fast speed base on Cheerio
- Automatic Read Title & Content
- Follow Redirects
- Automatic Decoding Content Encodings(Avoid Messy Codes, Especially Chinese)
- Gzip/Deflate Encoding(Automatic Decompress)
- Proxy
- Generate User-Agent

## Installation
```javascript
npm install read-art
```

## Usage
```javascript
read(html/uri [, options], callback)
```

read-art is designed to be the simplest way possible to make web-article scrape, it supports the definitions such as:

  * **html/uri** Html or Uri string.
  * **options** An optional options object, including:
    - **output** The data type of article content, including: html, text. see more from [Output](#output)
    - **killBreaks** A value indicating whether kill breaks, blanks, tab symbols(\r\t\n) into one `<br />` or not, `true` as default.
    - **options from [cheerio](https://github.com/cheeriojs/cheerio)**
    - **options from [req-fast](https://github.com/Tjatse/req-fast)**
  * **callback** The callback to run - `callback(error, article, options)`

> See test or examples folder for a complete example

Just try it
```javascript
var read = require('read-art');
// read from google could be
read('http://google.com', { charset: 'utf8' }, function(err, art, options){
  if(err){
    throw err;
  }
  var title = art.title,      // title of article
      content = art.content,  // content of article
      html = art.html;        // whole original innerHTML
});
// or
read({ uri: 'http://google.com', charset: 'utf8' }, function(err, art, options){

});
// what about html?
read('<title>node-art</title><body><div><p>hello, read-art!</p></div></body>', { charset: 'utf8' }, function(err, art, options){

});
// of course could be
read({ uri: '<title>node-art</title><body><div><p>hello, read-art!</p></div></body>', charset: 'utf8' }, function(err, art, options){

});
```
**CAUTION:** Title must be wrapped in a `<title>` tag and content must be wrapped in a `<body>` tag.

## Output
You can set different types to wrap the outputs
### text
Returns the inner text of article content(strip html tags), e.g.:
```javascript
read('http://example.com', {
  output: 'text'
}, function(err, art){
  // art.content will be formatted as TEXT
});
// or
read('http://example.com', {
  output: {
    type: 'text',
    stripSpaces: true
  }
}, function(err, art){
  // art.content will be formatted as TEXT
});
```

### html
Returns the inner HTML of article content, e.g.:
```javascript
read('http://example.com', {
  output: 'html'
}, function(err, art){
  // art.content will be formatted as HTML
});
// or
read('http://example.com', {
  output: {
    type: 'html',
    stripSpaces: true
  }
}, function(err, art){
  // art.content will be formatted as HTML
});
```

### json
Returns the restful result of article content, e.g.:
```javascript
read('http://example.com', {
  output: 'json'
}, function(err, art){
  // art.content will be formatted as JSON
});
// or
read('http://example.com', {
  output: {
    type: 'json',
    stripSpaces: true
  }
}, function(err, art){
  // art.content will be formatted as JSON
});
```
The art.content will be an Array such as:
```json
[
  { "type": "img", "value": "http://example.com/jpg/site1/20140519/00188b1996f214e3a25417.jpg" },
  { "type": "text", "value": "TEXT goes here..." }
]
```
There only two types are supported now: *img* and *text*

As you see, the output could be defined in two ways:
1. Simple String, should be one of *text*, *html* and *json*.
2. Complex Object, including:
  - type: one of *text*, *html* and *json*, default as 'html'.
  - stripSpaces: a value indicating whether strip tab symbols(\r\t\n), default as false.

## Features
### Refrain from the crazy messy codes
```javascript
read('http://game.163.com/14/0506/10/9RI8M9AO00314SDA.html', {
  charset: 'gbk'
}, function(err, art){
  // ...
});
```

### Generate agent to simulate browsers
```javascript
read('http://example.com', {
  agent: true // true as default
}, function(err, art){
  // ...
});
```

### Use proxy to avoid being blocked.
```javascript
read('http://example.com', {
  proxy: {
    host: 'http://myproxy.com/',
    port: 8081,
    proxyAuth: 'user:password'
  }
}, function(err, art){
  // ...
});
```

## Test
```
npm test
```

## Other Library
### [luin/node-readability](https://github.com/luin/node-readability)
luin/node-readability is the first module which implements Readability in node.js, lots of hit points, easy to use, but the problem is - Too slow. It was based on `JSDOM`, the HTML must be written in strict mode, you can not make any mistake, e.g.:

```html
<P>Paragraphs</p>
<p>My book name is <read-art></p>
<div><p>Hey, dude!</div>
```
All above will cause hiberarchy errors, and otherwise, `JSDOM` is a memory killer.

### [bndr/node-read](https://github.com/bndr/node-read)
bndr/node-read is good, and I've contributed on this for a while, but it's hard to communicate with Vadim(we are in a different timezone), and we have very different ideas. So I decided to write it on my own.

## TODO
- [x] get video, img tags
- [ ] get published time
- [ ] get author
- [ ] get source
- [ ] pagination
- [x] more tests

## License
Copyright 2014 Tjatse

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.



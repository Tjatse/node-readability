read-art [![NPM version](https://badge.fury.io/js/read-art.svg)](http://badge.fury.io/js/read-art) [![Build Status](https://travis-ci.org/Tjatse/node-readability.svg?branch=master)](https://travis-ci.org/Tjatse/node-readability)
=========
[![NPM](https://nodei.co/npm/read-art.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/read-art/)

1. Readability reference to Arc90's.
2. Scrape article from any page (automatically).
3. Make any web page readable, no matter Chinese or English.

> *快速抓取网页文章标题和内容，适合node.js爬虫使用，服务于ElasticSearch。*

## Guide
- [Features](#features)
- [Performance](#perfs)
- [Installation](#ins)
- [Usage](#usage)
- [Score Rule](#score_rule)
- [Customize Settings](#cus_sets)
- [Output](#output)
- [Notes](#notes)

<a name="features" />
## Features
- Fast And Shoot Straight.
- High Performance - Less memory
- Automatic Read Title & Content
- Follow Redirects
- Automatic Decoding Content Encodings(Avoid Messy Codes, Especially Chinese)
- Gzip/Deflate Support
- Proxy Support
- Generate User-Agent

<a name="perfs" />
## Performance
In my case, the indexed data is about **400 thousand per day**, **10 million per month**, and the maximize indexing speed is **35/second**, the memory cost are limited **under 100 megabytes**.

**Pictures don't lie:**

![image](screenshots/es.jpg)

![image](screenshots/performance.jpg)

![image](screenshots/mem.jpg)

![image](screenshots/search.jpg)

**Notes**
- All the spiders are managed by [PM2](https://github.com/Unitech/PM2) (I am currently working on that with friends, very welcome to use this amazing tool).
- Loose coupling between Spiders, Indexers and Data, they're queued by NSQ.

<a name="ins" />
## Installation
```javascript
npm install read-art
```

<a name="usage" />
## Usage
```javascript
read(html/uri [, options], callback)
```

It supports the definitions such as:
  * **html/uri** Html or Uri string.
  * **options** An optional options object, including:
    - **output** The data type of article content, including: `html`, `text` or `json` (head over to [Output](#output) to get more information).
    - **killBreaks** A value indicating whether kill breaks, blanks, tab symbols(\r\t\n) into one `<br />` or not, `true` by default.
    - **minTextLength** If the content is less than `[minTextLength]` characters, don't even count it, `25` by default.
    - **options from [cheerio](https://github.com/cheeriojs/cheerio)**
    - **options from [req-fast](https://github.com/Tjatse/req-fast)**
    - **scoreRule** Customize the score rules of each node, one arguments will be passed into the callback function (head over to [Score Rule](#score_rule) to get more information):
      - **node** The [cheerio object](https://github.com/cheeriojs/cheerio#selectors).
  * **callback** The callback to run - `callback(error, article, options)`

> Head over to test or examples directory for a complete example.

<a name="usage_eg" />
### Examples
```javascript
var read = require('read-art');
// read from google:
read('http://google.com', function(err, art, options){
    if(err){
      throw err;
    }
    var title = art.title,      // title of article
        content = art.content,  // content of article
        html = art.html;        // whole original innerHTML
});
// or:
read({
    uri: 'http://google.com',
    charset: 'utf8'
  }, function(err, art, options){

});
// what about html?
read('<title>node-art</title><body><div><p>hello, read-art!</p></div></body>', function(err, art, options){

});
// of course could be
read({
    uri: '<title>node-art</title><body><div><p>hello, read-art!</p></div></body>'
  }, function(err, art, options){

});
```
**CAUTION:** Title must be wrapped in a `<title>` tag and content must be wrapped in a `<body>` tag.

**With High Availability: [spider2](https://github.com/Tjatse/spider2)**

<a name="score_rule" />
## Score Rule
In some situations, we need to customize score rules to grab the correct content of article, such as BBS and QA forums.
There are two effective ways to do this:
- **minTextLength**
  It's useful to get rid of useless elements (`P` / `DIV`), e.g. `minTextLength: 100` will dump all the blocks that `node.text().length` is less than `100`.

- **scoreRule**
  You can customize the score rules manually, e.g.:
  ```javascript:
  scoreRule: function(node){
    if (node.hasClass('w740')) {
      return 100;
    }
  }
  ```

  The elements which have the `w740` className will get `100` bonus points, that will make the `node` to be the *topCandidate*, which means it's enough to make the `text` of `DIV/P.w740` to be the content of current article.

<a name="score_rule_eg" />
### Example
```javascript
read('http://club.autohome.com.cn/bbs/thread-c-66-37239726-1.html', {
  minTextLength: 0,
  scoreRule: function(node){
    if (node.hasClass('w740')) {
      return 100;
    }
  }
}, function(err, art){

});
```

<a name="cus_sets" />
## Customize Settings
We're using different regexps to iterates over elements (cheerio objects), and removing undesirable nodes.
```javascript
read.use(function(){
  //[usage]
});

```

The `[usage]` could be one of following:
- `this.reset()`
  Reset the settings to default.
- `this.skipTags([tags], [override])`
  Remove useless elements by tagName, e.g. `this.skipTags('b,span')`, if `[override]` is set to `true`, `skiptags` will be `"b,span"`, otherwise it will be appended to the origin, i.e. :
  ```
  aside,footer,label,nav,noscript,script,link,meta,style,select,textarea,iframe,b,span
  ```

- `this.regexps.positive([re], [override])`
  If `positive` regexp test `id` + `className` of node success, it will be took as a candidate. `[re]` is a regexp, e.g. `/dv101|dv102/` will match the element likes `<div class="dv101">...` or `<div id="dv102">...`, if `[override]` is set to `true`, `positive` will be `/dv101|dv102/i`, otherwise it will be appended to the origin, i.e. :
  ```
  /article|blog|body|content|entry|main|news|pag(?:e|ination)|post|story|text|dv101|dv102/i
  ```

- `this.regexps.negative([re], [override])`
  If `negative` regexp test `id` + `className` of node success, it will not be took as a candidate. `[re]` is a regexp, e.g. `/dv101|dv102/` will match the element likes `<div class="dv101">...` or `<div id="dv102">...`, if `[override]` is set to `true`, `negative` will be `/dv101|dv102/i`, otherwise it will be appended to the origin, i.e. :
  ```
  /com(?:bx|ment|-)|contact|comment|captcha|foot(?:er|note)?|link|masthead|media|meta|outbrain|promo|related|scroll|shoutbox|sidebar|sponsor|util|shopping|tags|tool|widget|tip|dialog|copyright|bottom|dv101|dv102/i
  ```

- `this.regexps.unlikely([re], [override])`
  If `unlikely` regexp test `id` + `className` of node success, it probably will not be took as a candidate. `[re]` is a regexp, e.g. `/dv101|dv102/` will match the element likes `<div class="dv101">...` or `<div id="dv102">...`, if `[override]` is set to `true`, `unlikely` will be `/dv101|dv102/i`, otherwise it will be appended to the origin, i.e. :
  ```
  /agegate|auth?or|bookmark|cat|com(?:bx|ment|munity)|date|disqus|extra|foot|header|ignore|link|menu|nav|pag(?:er|ination)|popup|related|remark|rss|share|shoutbox|sidebar|similar|social|sponsor|teaserlist|time|tweet|twitter|\bad[\s_-]?\b|dv101|dv102/i
  ```

- `this.regexps.maybe([re], [override])`
  If `maybe` regexp test `id` + `className` of node success, it probably will be took as a candidate. `[re]` is a regexp, e.g. `/dv101|dv102/` will match the element likes `<div class="dv101">...` or `<div id="dv102">...`, if `[override]` is set to `true`, `maybe` will be `/dv101|dv102/i`, otherwise it will be appended to the origin, i.e. :
  ```
  /and|article|body|column|main|column|dv101|dv102/i
  ```

- `this.regexps.div2p([re], [override])`
  If `div2p` regexp test `id` + `className` of node success, all divs that don't have children block level elements will be turned into p's. `[re]` is a regexp, e.g. `/<(span|label)/` will match the element likes `<span>...` or `<label>...`, if `[override]` is set to `true`, `div2p` will be `/<(span|label)/i`, otherwise it will be appended to the origin, i.e. :
  ```
  /<(a|blockquote|dl|div|img|ol|p|pre|table|ul|span|label)/i
  ```

<a name="cus_sets_eg" />
### Example
```javascript
read.use(function(){
  this.reset();
  this.skipTags('b,span');
  this.regexps.div2p(/<(span|b)/, true);
});
```

<a name="output" />
## Output
You can wrap the content of article with different types, the `output` option could be:
- **String**
  One of `text`, `html` and `json`, `html` by default.
- **Object**
  Key-value pairs including:
  - **type**
    One of `text`, `html` and `json`.
  - **stripSpaces**
    A value indicates whether strip the tab symbols (\r\n\t) or not, `false` by default.

<a name="output_text" />
### text
Returns the inner text, e.g.:
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

<a name="output_html" />
### html
Returns the inner HTML, e.g.:
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

**Notes** Videos could be scraped now, the domains currently are supported: *youtube|vimeo|youku|tudou|56|letv|iqiyi|sohu|sina|163*.

<a name="output_json" />
### json
Returns the restful result, e.g.:
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
  // art.content will be formatted as Array
});
```

The art.content will be an Array such as:
```json
[
  { "type": "img", "value": "http://example.com/jpg/site1/20140519/00188b1996f214e3a25417.jpg" },
  { "type": "text", "value": "TEXT goes here..." }
]
```

Util now there are only two types - *img* and *text*, the `src` of `img` element is absolute even if the original is a relative one.

**Notes** The video sources of the sites are quite different, it's hard to fit all in a common way, I haven't find a good way to solve that, PRs are in demand.

<a name="notes" />
## Notes / Gotchas
**Pass the charset manually to refrain from the crazy messy codes**
```javascript
read('http://game.163.com/14/0506/10/9RI8M9AO00314SDA.html', {
  charset: 'gbk'
}, function(err, art){
  // ...
});
```

**Generate agent to simulate browsers**
```javascript
read('http://example.com', {
  agent: true // true as default
}, function(err, art){
  // ...
});
```

**Use proxy to avoid being blocked**
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
luin/node-readability is an old Readability that be transformed from **Arc90**, easy to use, but the problem is - TOO SLOW. It was based on `jsdom`, so, the HTML must be written in strict mode, which means you can not make any mistake, e.g.:

```html
<P>Paragraphs</p>
<p>My book name is <read-art></p>
<div><p>Hey, dude!</div>
```

All above will cause `hiberarchy errors`, more seriously, `jsdom` is a memory killer.

### [bndr/node-read](https://github.com/bndr/node-read)
I've contributed on this for a while, but it's hard to communicate with Vadim(we are in a different timezone), and we have very different ideas. So I decided to write it on my own.

## TODO
- [ ] get published time
- [ ] get author
- [ ] get source
- [ ] pagination

## License
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.



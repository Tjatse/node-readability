# read-art -- readability reference to Arc90's
Scrape article from any page, automatically. make any web page readability, no matter Chinese or English,very useful for ElasticSearch data spider.

快速抓取网页文章标题和内容，适合node.js爬虫使用，服务于ElasticSearch。

## Installation
`npm install read-art`

## Usage
see test or examples folder for a complete example

## Read Article
`read(html|uri [, options], callback)`

read-art is designed to be the simplest way possible to make web-article scrape, it supports the definitions such as:

Where
  * **html|uri** html or uri string.
  * **options** is an optional options object
  * **callback** is the callback to run - `callback(error, article, options)`

Example
scrape by uri?
```javascript
var read = require('read-art');
read('http://google.com', { overrideCharset: 'utf8' }, function(err, art, options){
  if(err){
    throw err;
  }
  var title = art.title,      // title of article
      content = art.content,  // content of article
      html = art.html;        // whole original innerHTML
});
```

or
```javascript
read({ uri: 'http://google.com', overrideCharset: 'utf8' }, function(err, art, options){
  ...
});
```

what about simple html?

```javascript
read('<title>node-art</title><body><div><p>hello, read-art!</p></div></body>', { overrideCharset: 'utf8' }, function(err, art, options){
  ...
});
```

or
```javascript
read({ uri: '<title>node-art</title><body><div><p>hello, read-art!</p></div></body>', overrideCharset: 'utf8' }, function(err, art, options){
  ...
});

```

or
```javascript
read({ html: '<title>node-art</title><body><div><p>hello, read-art!</p></div></body>', overrideCharset: 'utf8' }, function(err, art, options){
  ...
});
```

**CAUTION** title must be wrapped in a *title* tag and content must be wrapped in a *body* tag.

## Options
### dataType
The data type of article content, including: html, text.

### cacheable
A value indicating whether cache body && title.

### killBreaks
Kill breaks, blanks, tab symbols(\r\t\n) into one <br />.

###options from [cheerio](https://github.com/cheeriojs/cheerio)
### xmlMode
Indicates whether special tags (`<script>` and `<style>`) should get special treatment and if "empty" tags (eg. `<br>`) can have children. If false, the content of special tags will be text only.

For feeds and other XML content (documents that don't consist of HTML), set this to true. Default: false.

### lowerCaseTags
If set to true, all tags will be lowercased. If xmlMode is disabled, this defaults to true.

### normalizeWhitespace
Returns the innerHTML with the leading, trailing, and repeating white spaces stripped.

### options from [fetch](https://github.com/andris9/fetch)
[Click Here To Redirect](https://github.com/andris9/fetch#options)

## Features
__&#991; Blazingly fast:__
read-art is based on cheerio(cheerio is about __8x__ faster than JSDOM), and the article marking strategy actualized by RegExp, it's supper fast and cost less memory.

__&#10084; Hit the target:__
the bonus algorithm make spider or scraper more easier to grab the article title & content.

__&#10049; Fetch:__
if you only wanna fetch html body by url, [fetch](https://github.com/andris9/fetch) is an amazing library, i've test it with [request](https://github.com/mikeal/request), it's really fast and cost less memory, reference to [Vadim's Issue](https://github.com/bndr/node-read/pull/15)
and more important, **fetch** could avoid messy code in 99.9% conditions, event some pages using *utf8* in response headers, but *gb2312* in html head meta, we only need to use the overrideCharset option, e.g.:
```javascript
read('http://game.163.com/14/0506/10/9RI8M9AO00314SDA.html', {
  overrideCharset: 'gbk'
}, function(err, art){
  ...
});
```
to refrain from the crazy messy codes.

## Test
cd to the read-art directory and install all the dependencies library.

`./node_modules/.bin/mocha -R Spec -t 10000`

## Other Library
### [luin/node-readability](https://github.com/luin/node-readability)
luin/node-readability is really good, lots of hit points, easy to use, but the problem is - it's too slow, make me mad. it was based on JSDOM, as you known, the HTML must be strict, you can not make any mistake, e.g.:

```html
<P>Paragraphs</p>
<p>My book name is <read-art></p>
<div><p>Hey, dude!</div>
```
all above will cause hiberarchy errors.
and otherwise, JSDOM is a memory killer.

### [bndr/node-read](https://github.com/bndr/node-read)
bndr/node-read is amazing, and i've worked on this for a while, but it's hard to communicate with Vadim(we are in a different timezone), and we have very different ideas. so i decided to write it on my own.

## TODO
- get video, img tags
- get published time
- get author
- get source
- pagination
- more tests

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



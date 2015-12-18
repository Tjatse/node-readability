"use strict";

var entities = require('entities'),
  read = require('./reader');

module.exports = Article;

/**
 * The article implementation.
 * @param $ dom.
 * @param options the options.
 * @return {Object}
 * @constructor
 */
function Article($, options) {
  var self = this;
  self.$ = $;
  self.caches = {};
  self.options = options;

  // return content,title and html wrapped object.
  var article = {
    html: $.html()
  };
  Object.defineProperty(article, 'content', {
    get: self.getContent.bind(self)
  });
  Object.defineProperty(article, 'title', {
    get: self.getTitle.bind(self)
  });

  if (typeof options.selectors == 'object') {
    Object.keys(options.selectors).forEach(function (prop) {
      if(!!~['title', 'content'].indexOf(prop)){
        return;
      }
      Object.defineProperty(article, prop, {
        get: function () {
          var sel = read.selector(options.selectors[prop], 'text');
          if (!sel) {
            return null;
          }
          return read.extract(self.$, self.$(sel.selector), sel.extract);
        }
      });
    });
  }

  if(typeof options.dom == 'undefined'){
    options.dom = false;
  }
  if(options.dom){
    Object.defineProperty(article, 'dom', {
      get: function(){
        return self.$;
      }
    });
  }
  return article;
}

/**
 * Custom settings.
 * @type {readArt.use}
 */
Article.use = read.use;

/**
 * Get content of article.
 * @return {*}
 */
Article.prototype.getContent = function () {
  var content;
  // if cache exists, return it directly.
  if ((content = this.caches['article-content'])) {
    return content;
  }
  var node;


  var output = this.options.output;
  if (typeof output == 'string') {
    output = {
      type: output
    };
  }

  if (!output.type || ['text', 'json', 'html', 'cheerio'].indexOf(output.type) == -1) {
    output.type = 'html';
  }

  if (options.selectors && options.selectors.content) {
    var sel = readArt.selector(options.selectors.content, output.type);
    if (!sel) {
      return null;
    }
    node = this.$(sel.selector);
    if (!node || node.length == 0) {
      content = readArt.extract(this.$, node, sel.extract);
    }
  } else {
    // read it by article reader.
    node = read(this.$, this.options);
    if (node && node.length > 0) {
      var tidyAttrs = false;
      if(output.type == 'html'){
        tidyAttrs = this.options.tidyAttrs;
      }
      content = read.extractor[output.type.toLowerCase()](this.$, node, output, tidyAttrs);
    }
  }
  this.caches['article-content'] = content;

  return content;
};


/**
 * Get title of article.
 * @return {*}
 */
Article.prototype.getTitle = function () {
  // if cache exists, return it directly.
  var title;
  if ((title = this.caches['article-title'])) {
    return title;
  }
  if (this.options.selectors && this.options.selectors.title) {
    var sel = read.selector(this.options.selectors.title, 'text');
    if (sel) {
      var node = this.$(sel.selector);
      if (!node || node.length == 0) {
        return title;
      }
      title = read.extract(this.$, node, sel.extract);
      return (this.caches['article-title'] = title);
    }
  }


  var node = this.$('title');
  // make sure title exists.
  title = (node && node.length > 0 ? node.text().trim() : '');
  if (!title) {
    return title;
  }

  title = entities.decode(title);

  // split title by separators.
  var betterTitle = '',
    subTitles = title.split(/[\|\-–_«»]/g),
    betterTitleExist = function (t) {
      return (t && t.length >= 10);
    };

  // when find better title, break the loop.
  subTitles.forEach(function (t) {
    if (betterTitleExist(betterTitle)) {
      return false;
    }

    t = t.trim();
    if (t) {
      betterTitle += ' ' + t;
    }
  });

  // length of better title must gte 10.
  if (betterTitleExist(betterTitle)) {
    title = betterTitle.trim();
  }
  // releasing...
  betterTitleExist = null;
  betterTitle = null;

  this.caches['article-title'] = title;

  return title;
};

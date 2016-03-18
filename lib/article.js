'use strict'

var entities = require('entities')
var cheerio = require('cheerio')
var read = require('./reader')
var debug = require('debug')('read-art.article')

module.exports = Article

/**
 * The article implementation.
 * @param $ dom.
 * @param options the options.
 * @return {Object}
 * @constructor
 */
function Article (o) {
  var co = {
    decodeEntities: false
  }
  var cheerioOptions = ['normalizeWhitespace', 'xmlMode', 'lowerCaseTags']
  cheerioOptions.forEach(function (n) {
    co[n] = !!o.options[n]
  })

  var $ = cheerio.load(o.html, co)
  this.$ = $

  this.caches = {}

  var options = o.options
  this.options = options

  // return content,title and html wrapped object.
  this.html = o.html
  Article.prototype.__defineGetter__('content', this.getContent)

  Article.prototype.__defineGetter__('title', this.getTitle)

  if (typeof options.dom === 'undefined') {
    options.dom = false
  }
  if (options.dom) {
    this.dom = $
  }

  Article.prototype.__defineGetter__('$_', function () {
    if (this.caches.dom) {
      return this.caches.dom
    }
    return (this.caches.dom = cheerio.load(o.html, co)) // eslint-disable-line no-return-assign
  })

  if (typeof options.selectors === 'object') {
    debug('defining customized extracters with CSS Selectors...')
    Object.keys(options.selectors).forEach(function (prop) {
      if (!!~['title', 'content'].indexOf(prop)) { // eslint-disable-line no-extra-boolean-cast
        return
      }
      if (debug.enabled) {
        debug('∟ ' + prop)
      }
      Article.prototype.__defineGetter__(prop, function () {
        var propCacheKey = 'prop_' + prop
        if (this.caches[propCacheKey]) {
          return this.caches[propCacheKey]
        }
        var sel = read.selector(options.selectors[prop], 'text')
        if (!sel) {
          if (debug.enabled) {
            debug('  ∟ seletor of ' + prop + ' is invalid, simply returned')
          }
          return null
        }
        if (debug.enabled) {
          debug('∟ extracting and caching [' + prop + ']')
        }
        return (this.caches[propCacheKey] = read.extract(this.$_, this.$_(sel.selector), sel.extract, this.options)) // eslint-disable-line no-return-assign
      })
    })
  }
}

/**
 * Custom settings.
 * @type {readArt.use}
 */
Article.use = read.use

/**
 * Get content of article.
 * @return {*}
 */
Article.prototype.getContent = function () {
  var content
  // if cache exists, return it directly.
  if (typeof (content = this.caches['article-content']) !== 'undefined') { // eslint-disable-line no-cond-assign
    debug('get content from cache')
    return content
  }
  var node

  var output = this.options.output
  if (typeof output === 'string') {
    output = {
      type: output
    }
  }

  if (!output.type || ['text', 'json', 'html', 'cheerio'].indexOf(output.type) === -1) {
    output.type = 'html'
  }

  if (this.options.selectors && this.options.selectors.content) {
    if (debug.enabled) {
      debug('get [' + output.type + '] content with CSS selector')
    }
    var sel = read.selector(this.options.selectors.content, output.type)
    if (!sel) {
      return null
    }
    node = this.$(sel.selector)
    read.fixLink(this.$, this.options.uri, node, this.options)
    if (node && node.length > 0) {
      content = read.extract(this.$, node, sel.extract, this.options)
    }
  } else {
    if (debug.enabled) {
      debug('get [' + output.type + '] content with Reader')
    }
    // read it by article reader.
    node = read(this.$, this.options)
    if (node && node.length > 0) {
      content = read.extractor[output.type.toLowerCase()](this.$, node, output, this.options)
    }
  }
  debug('∟ caching content')
  return (this.caches['article-content'] = content)  // eslint-disable-line no-return-assign
}

/**
 * Get title of article.
 * @return {*}
 */
Article.prototype.getTitle = function () {
  // if cache exists, return it directly.
  var title
  if (typeof (title = this.caches['article-title']) !== 'undefined') { // eslint-disable-line no-cond-assign
    debug('get title from cache')
    return title
  }
  if (this.options.selectors && this.options.selectors.title) {
    debug('get title with CSS selector')
    var sel = read.selector(this.options.selectors.title, 'text')
    if (sel) {
      var node = this.$(sel.selector)
      if (!node || node.length === 0) {
        return title
      }
      title = read.extract(this.$, node, sel.extract, this.options)
      return (this.caches['article-title'] = title) // eslint-disable-line no-return-assign
    }
  } else {
    debug('get title with Reader')
  }

  var nodeTitle = this.$('title')
  // make sure title exists.
  title = (nodeTitle && nodeTitle.length > 0 ? nodeTitle.text().trim() : '')
  if (!title) {
    debug('∟ could not extract title from article, simply returned an empty String')
    return ''
  }

  debug('∟ find a better title if necessary')
  title = entities.decode(title)

  // split title by separators.
  var betterTitleFn
  var betterTitleOp = this.options.betterTitle
  var minTitleLength = 10

  if (typeof betterTitleOp === 'function') {
    betterTitleFn = betterTitleOp
  } else if (!isNaN(betterTitleOp)) {
    minTitleLength = parseInt(betterTitleOp)
  }

  var betterTitleExist = function (t) {
    return t && t.length >= minTitleLength
  }

  if (!betterTitleFn) {
    var betterTitle = ''
    var subTitles = title.split(/[\|\–—\-_«»]/g)

    // when find better title, break the loop.
    subTitles.forEach(function (t) {
      if (betterTitleExist(betterTitle)) {
        return false
      }

      t = t.trim()
      if (t) {
        betterTitle += ' ' + t
      }
    })

    // length of better title must gte 10.
    if (betterTitleExist(betterTitle)) {
      title = betterTitle.trim()
    }
    // releasing...
    betterTitleExist = null
    betterTitle = null
  } else {
    title = betterTitleFn(title) || ''
  }
  debug('∟ caching title')
  return (this.caches['article-title'] = title) // eslint-disable-line no-return-assign
}

'use strict'

var URI = require('urijs')
var util = require('util')
var entities = require('entities')
var debug = require('debug')
var debugRd = debug('read-art.reader')
var debugDo = debug('read-art.doctype')

var scoreKey = 'read-art-score'
var extBonusKey = 'read-art-extra-bonus'
var unlikelyKey = 'read-art-unlikely-candidate'
var regexps = {
  stopwords: /[.。:：!！;；?？、](\s|$)/,
  videos: /(youtube|vimeo|youku|tudou|56|letv|iqiyi|sohu|sina|163)\.(com|com\.cn|cn|net)/i,
  commas: /[,，.。;；?？、]/g
}
var extRegexps = {
  positive: /article|blog|body|content|entry|main|news|pag(?:e|ination)|post|story|text/i,
  negative: /com(?:bx|ment|-)|contact|comment|captcha|foot(?:er|note)?|link|masthead|media|meta|outbrain|promo|related|scroll|shoutbox|sidebar|sponsor|util|shopping|tags|tool|widget|tip|dialog|copyright|bottom/i,
  unlikely: /agegate|auth?or|bookmark|cat|com(?:bx|ment|munity)|date|disqus|extra|foot|header|ignore|link|menu|nav|pag(?:er|ination)|popup|related|remark|rss|share|shoutbox|sidebar|similar|social|sponsor|teaserlist|time|tweet|twitter|\bad[\s_-]?\b/i,
  maybe: /and|article|body|column|main|column/i,
  div2p: /<(a|blockquote|dl|div|img|ol|p|pre|table|ul|span|font|label)/i,
  uselessAnchors: /(\d+|next|prev|first|last|print|comment|mail|font|about|contact|(下|下|前|后)一|(首|尾)页)|打印|评论|邮件|信箱|转发|关于|联系|^(大|中|小)$/i,
  images: /\.(gif|jpe?g|png|webp)/i
}
var tagsToSkip = ''
var tagsOfMedia = ''
var tagsOfRelated = ''

// read article.
module.exports = readArt

/**
 * Default settings.
 */
function defSettings () {
  tagsToSkip = 'aside,footer,nav,noscript,script,link,meta,style,select,textarea,iframe'
  tagsOfMedia = 'img,object,embed,video'
  tagsOfRelated = 'ul,ol'
  util._extend(regexps, extRegexps)
}

defSettings()

/**
 * Read article.
 * @param $
 * @param options
 * @returns {*}
 */
function readArt ($, options) {
  // 1st. node prepping, trash node that look cruddy, and
  //      turn divs into P's where they have been used in appropriately .
  var cans = getCandidates($, options)

  // 2nd. loop through all of the possible candidate nodes we found
  //      and find the one with the highest score.
  var topCandidate = getTopCandidate($, cans)
  // 3nd. grab article
  if (topCandidate && topCandidate.length > 0) {
    return grabArticle($, topCandidate, options)
  } else {
    debugRd(' ∟ there is no top candidate existing, simply returned')
    return null
  }
}

/**
 * Customize settings.
 * @param fn
 */
readArt.use = function (fn) {
  var ctx = {
    reset: defSettings,
    skipTags: function (tags, override) {
      if (debugRd.enabled) {
        debugRd(' ∟ extending [skipTags]')
      }
      tagsToSkip = override ? tags : (tagsToSkip + ',' + tags)
    },
    relatedTags: function (tags, override) {
      if (debugRd.enabled) {
        debugRd(' ∟ extending [relatedTags]')
      }
      tagsOfRelated = override ? tags : (tagsOfRelated + ',' + tags)
    },
    medias: function (medias, override) {
      if (debugRd.enabled) {
        debugRd(' ∟ extending [medias]')
      }
      tagsOfMedia = override ? medias : (tagsOfMedia + ',' + medias)
    },
    regexps: {}
  }
  Object.keys(extRegexps).forEach(function (key) {
    ctx.regexps[key] = function (re, override) {
      if (debugRd.enabled) {
        debugRd(' ∟ extending [' + key + ']')
      }
      regexps[key] = override ? (typeof re1 === 'string' ? new RegExp(re, 'i') : re) : new RegExp('(' + re.source + ')|(' + extRegexps[key].source + ')', 'i')
    }
  })
  fn.call(ctx)
}

/**
 * Read selector.
 * @param  {Mixed} selector
 * @param  {Mixed} defaultExtract
 * @return {[type]}
 */
readArt.selector = function (selector, defaultExtract) {
  if (typeof selector === 'string') {
    selector = {
      selector: selector,
      extract: defaultExtract
    }
  }

  if (typeof selector.selector !== 'string') {
    return null
  }
  if (!selector.extract) {
    selector.extract = defaultExtract
  }
  return selector
}
/**
 * Extract data from cheerio object.
 * @param  {cheerio} $
 * @param  {cheerio} nodes
 * @param  {Object} sel
 * @param  {Object} options
 * @return {[type]}
 */
readArt.extract = function ($, nodes, sel, options) {
  if (!nodes || nodes.length === 0) {
    debugRd(' ∟ no node could be found with CSS selector, simply returned')
    return null
  }
  var tpoSTs = typeof sel.skipTags
  if (!(tpoSTs === 'boolean' && !sel.skipTags)) {
    nodes.find(tpoSTs === 'string' ? sel.skipTags : tagsToSkip).remove()
  }

  var extract = sel.extract
  if (typeof extract === 'function') {
    return extract(nodes, options)
  }

  var isArray = Array.isArray(extract)
  var isObject
  var props

  if (isArray) {
    props = extract
  } else {
    isObject = Object.prototype.toString.call(extract) === '[object Object]'
    if (isObject) {
      props = Object.keys(extract)
    }
  }
  var data = []
  options = options || {}

  nodes.each(function () {
    var node = $(this)
    var item

    if (isArray || isObject) {
      props.forEach(function (mapping) {
        var prop = mapping
        if (isObject) {
          prop = extract[mapping]
        }
        var propType = typeof prop
        var it
        if (propType === 'string') {
          it = readArt.extractProp($, node, prop, options)
        } else if (propType === 'function') {
          it = prop(node, options)
        }
        if (it) {
          (item = item || {})[mapping] = it
        }
      })
    } else {
      item = readArt.extractProp($, node, extract, options)
    }
    if (Array.isArray(item)) {
      data = data.concat(item)
    } else if (item) {
      data.push(item)
    }
  })

  if (data.length === 1 && (nodes.length === 1 || typeof data[0] === 'string')) {
    debugRd(' ∟ get the first element in the set of extracted elements')
    return data[0]
  }

  var notStringArray = data.some(function (d) {
    return typeof d !== 'string'
  })

  if (!notStringArray) {
    debugRd(' ∟ join the extracted stringify elements, and returning it')
    return data.join(' ')
  }
  debugRd(' ∟ get the extracted elements')
  return data
}

/**
 * Extract property.
 * @param  {cheerio} $
 * @param  {cheerio} node
 * @param  {String} propName
 * @param  {Object} options
 * @return {[type]} [description]
 */
readArt.extractProp = function ($, node, propName, options) {
  if (debugRd.enabled) {
    debugRd('   ∟ ' + propName)
  }
  switch (propName) {
    case 'text':
      return readArt.extractor.text($, node, {
        break: true,
        stripSpaces: true
      }, options)
    case 'html':
      return readArt.extractor.html($, node, {stripSpaces: true}, options)
    case 'cheerio':
      return node
    case 'json':
      return readArt.extractor.json($, node, {stripSpaces: true}, options)
    default:
      return node.attr(propName)
  }
}

readArt.extractor = {
  json: function ($, nodes, output, options) {
    var retVal = []
    // {escapeBreak: true, break: true, stripSpaces: true}
    var para = ''
    var setPara = function () {
      if (para) {
        retVal.push({
          type: 'text',
          value: para
        })
        para = ''
      }
    }
    var setImg = function (img) {
      var src
      if (src = img.attr('src')) { // eslint-disable-line no-cond-assign
        setPara()
        retVal.push({
          type: 'img',
          value: src
        })
        return true
      }
      return false
    }
    nodes.each(function () {
      var node = $(this)
      var children = node.contents()
      // if only one dom node, return the innerText.
      if (children.length === 0) {
        retVal.push({
          type: 'text',
          value: readArt.extractor.text($, node, output, options)
        })
        return
      }
      children.each(function () {
        var child = $(this)
        if (child.length !== 1) {
          return
        }
        var tagName
        if ((tagName = child.get(0).name) === 'img') {
          return setImg(child)
        }
        child.find('img').each(function () {
          setImg($(this))
        })
        if (para && (tagName === 'div' || tagName === 'p')) {
          setPara()
        }
        // find text.
        var text = readArt.extractor.text($, child, output, options)
        if (text && text.trim().length > 0) {
          if (output.break) {
            var txts = []
            text.split(/[\n\r\t]+/g).forEach(function (txt) {
              if (txt && txt.trim().length > 0 && !/^[\\n\t\r]+$/.test(txt)) {
                txts.push(txt)
              }
            })
            if (txts.length === 1) {
              para += txts[0]
            } else if (txts.length > 1) {
              setPara()
              txts.forEach(function (txt) {
                para = txt
                setPara()
              })
            }
          } else {
            para += text
          }
        }
      })
      setPara()
    })
    setImg = null
    setPara = null
    return retVal
  },
  text: function ($, nodes, output, options) {
    var text = ''
    nodes.each(function () {
      var node = $(this)
      if (output.break) {
        node.html(node.html().replace(/<br[^/>]*\/?>/ig, '\\n'))
      }
      var txt = node.text().trim()
      if (output.stripSpaces) {
        txt = txt.replace(/\s(\s+)/g, ' ').replace(/[\r\t]/g, '').replace(/\n(\n+)/g, '\\n')
      }
      text += (options.forceDecode ? entities.decode(txt) : txt) + ' '
    })

    return text.trim()
  },
  html: function ($, nodes, output, options) {
    var html = nodes.html()
    // strip tab symbols(\r\t\n)
    if (output.stripSpaces) {
      html = html.replace(/([\r\t\n]+)/g, ' ')
    }
    html = options.forceDecode ? entities.decode(html) : html
    if (options.tidyAttrs) {
      try {
        html = html.replace(/<([a-z][a-z0-9]*)(?:[^>]*(\s(?:src|href)=['"][^'"]*['"]))?[^>]*?(\/?)>/ig, '<$1$2$3>')
      } catch (err) {}
    }
    return html
  },
  cheerio: function ($, nodes) {
    return nodes
  }
}

/**
 * Get scored candidates from paragraphs.
 * @param $ dom
 * @param options options
 * @return {Array}
 */
function getCandidates ($, options) {
  debugRd(' get all cadidates (div, p)')
  // remove useless tags.
  $(tagsToSkip).remove()

  if (options.forceRemoveRelated && tagsOfRelated) {
    debugRd.enabled && debugRd('force remove related article list in ' + tagsOfRelated)
    $(tagsOfRelated).each(function () {
      var node = $(this)
      // make sure node exists.
      if (!node || node.length === 0) {
        return
      }
      var linkDensity = getLinkDensity($, node, { textOnly: true })
      debugDo.enabled && debugDo('  ∟ link density is ' + linkDensity)
      if (linkDensity >= options.minRelatedDensity) {
        node.remove()
        debugDo.enabled && debugDo('  ∟ removed \'cause >= ' + options.minRelatedDensity + ')')
      }
    })
  }

  var cans = []
  $('div,p', 'body').each(function () {
    var node = $(this)
    // make sure node exists.
    if (!node || node.length === 0) {
      return
    }

    var nodeAttr = getNodeAttr(node)
    var classAndId = nodeAttr.classAndId
    var tagName = nodeAttr.tagName

    if (debugDo.enabled && tagName !== 'p') {
      debugDo('∟ <' + tagName + ' /> ' + classAndId)
    }

    // remove element that invisible.
    if (node.css('display') === 'none' || node.css('visibility') === 'hidden') {
      debugDo('  ∟ removed \'cause invisible')
      return node.remove()
    }

    if (classAndId.search(regexps.unlikely) >= 0 && classAndId.search(regexps.maybe) < 0) {
      var parent = node.parent()
      if (parent && parent.length > 0) {
        parent.addClass(unlikelyKey)
      }
      debugDo('  ∟ removed \'cause unlikely')
      return node.remove()
    }

    // remove element that has no content.
    if (tagName === 'div' && node.contents().length < 1 && !node.text().trim()) {
      debugDo('  ∟ removed \'cause no content')
      return node.remove()
    }
    // turn all divs that don't have children block level elements into p's
    if (tagName === 'div') {
      // cache nodeHTML here.
      var nodeHTML
      if ((nodeHTML = node.html()).search(regexps.div2p) < 0) {
        debugDo('  ∟ convert <div /> to <p />')
        node.replaceWith('<p class="' + extBonusKey + '">' + nodeHTML + '</p>')
        nodeHTML = null
      } else {
        debugDo('  ∟ convert text children to <p />')
        node.contents().each(function () {
          var child = $(this)
          if (!child || child.length === 0) {
            return
          }
          // cache innerText here.
          var childDom = child.get(0)
          var innerText
          if (childDom.type === 'text' && (innerText = childDom.data.trim())) {
            child.replaceWith('<p class="' + extBonusKey + '">' + innerText + '</p>')
            innerText = null
          }
        })
      }
    } else if (tagName === 'p') {
      // loop through all P's, and assign a score to them.
      getNodeWeight(node, cans, options)
    }
  })
  // assign scores to `P`s that were turned from DIV by us.
  $('p.' + extBonusKey, 'body').each(function () {
    getNodeWeight($(this), cans, options)
  })
  return cans
}

/**
 * Get the attributes of node
 * @param  {Cheerio} node
 * @return {Object}
 */
function getNodeAttr (node) {
  var className = node.attr('class') || ''
  className = className ? '.' + className.split(' ').join('.') : ''

  var id = node.attr('id') || ''
  id = id ? '#' + id : ''

  return {
    tagName: node.get(0).name.toLowerCase(),
    classAndId: id + className
  }
}

/**
 * Get the score from a node candidate
 * @param  {Cheerio} node
 * @param  $ dom
 * @return {Number}
 */
function getScoreFromNodeCandidate (node, $) {
  var score = node.data(scoreKey) || 0
  var reduced = false
  score = score * (1 - getLinkDensity($, node))
  if (debugDo.enabled) {
    var attrs = getNodeAttr(node)
    debugDo('∟ <' + attrs.tagName + ' /> ' + attrs.classAndId)
  }

  if (node.hasClass(unlikelyKey)) {
    debugDo("  ∟ reduce weight cause' unlikely")
    score -= 10
    reduced = true
  }

  if (debugDo.enabled) {
    debugDo((reduced ? '  ' : '') + '  ∟ ' + score)
  }
  // set the score to the node for use later
  node.data(scoreKey, score)
  return score
}

/**
 * Get the highest score candidate node.
 * @param $ dom
 * @param cans candidates
 * @return {*|jQuery|HTMLElement}
 */
function getTopCandidate ($, cans) {
  var topCandidate = null
  var topCandidateScore = -10000

  if (debugRd.enabled) {
    debugRd(' get top condidate from ' + cans.length + ' candidates')
  }

  // loop over all the candidates to determine best candidate
  cans.forEach(function (node) {
    var score = getScoreFromNodeCandidate(node, $)
    if (!topCandidate || score > topCandidateScore) {
      topCandidate = node
      topCandidateScore = score
    }
  })

  // if we have a candidate, return it
  if (topCandidate) {
    if (debugRd.enabled) {
      var na = getNodeAttr(topCandidate)
      debugRd(' take the following node as top candidate:')
      debugRd(' ∟ <' + na.tagName + ' /> ' + na.classAndId)
    }
    return topCandidate
  }

  debugRd(' can not find the top candidate, using <body /> instead of it')
  return $('body')
}

/**
 * Grab article content from node.
 * @param $ dom
 * @param topCandidate the node element.
 * @param options optional settings
 */
function grabArticle ($, topCandidate, options) {
  var article = $('<div id="read-art"></div>')
  var siblingScoreThreshold = Math.max(10, topCandidate.data(scoreKey) * 0.2)
  var thresholdScoreType = typeof options.thresholdScore
  var siblings
  var parent

  if (thresholdScoreType !== 'undefined') {
    if (thresholdScoreType === 'number' && !isNaN(options.thresholdScore)) {
      siblingScoreThreshold = parseFloat(options.thresholdScore)
    } else if (thresholdScoreType === 'function') {
      var score = options.thresholdScore(topCandidate, scoreKey)
      if (!isNaN(score)) {
        siblingScoreThreshold = parseFloat(score)
      }
    }
  }
  var shouldRemoveRelatedLinks = false
  if (shouldUseParent(topCandidate, options) && (parent = getNBParent(topCandidate))) {
    // 1. topCandidate has not enough [P] children
    // 2. parent exist and not [BODY]
    debugRd(' ∟ top candidate has not enough <p /> children, take the parent node (not <body />) instead of it')
    siblings = parent.children()
    shouldRemoveRelatedLinks = true
  } else {
    // self children.
    siblings = topCandidate.children()
  }
  debugRd('   ∟ get siblings')
  var allowedMedias = tagsOfMedia ? tagsOfMedia.split(',') : null
  siblings.each(function () {
    var node = $(this)
    var na = getNodeAttr(node)
    var tagName = na.tagName
    var append = false
    if (node.is(topCandidate) || (node.data(scoreKey) || 0) > siblingScoreThreshold) {
      append = true
    }
    if (!append) {
      var text = node.text().trim()
      var textLen = text.length
      if (tagName === 'p') {
        var linkDensity = getLinkDensity($, node)
        if (textLen > options.minTextLength && linkDensity < options.thresholdLinkDensity) {
          append = true
        } else if ((textLen < options.minTextLength && linkDensity === 0) || text.search(regexps.stopwords) !== -1) {
          // end with .|。 commas must be a paragraph.
          append = true
        }
      } else if (!!~allowedMedias.indexOf(tagName)) { // eslint-disable-line no-extra-boolean-cast
        append = true
      } else if (textLen > 0 && regexps.div2p.test('<' + tagName)) {
        append = true
      }
    }

    var extraDebugInfo
    var ignoreMedias = false
    if (append && shouldRemoveRelatedLinks) {
      var linkDensity = getLinkDensity($, node, { strict: true }) // eslint-disable-line no-redeclare
      if (linkDensity >= 0.5) {
        append = false
        ignoreMedias = true
        if (debugDo.enabled) {
          extraDebugInfo = 'Probably related links which scores ' + linkDensity.toFixed(2)
        }
      }
    }
    if (append) {
      // remove comments.
      node.contents().filter(function (index, ele) {
        return ele.type === 'comment'
      }).remove()

      article.append(node)
    }
    if (debugDo.enabled) {
      debugDo('    ∟ <' + tagName + ' /> ' + na.classAndId)
      debugDo('      ∟ ' + (append ? 'append' : 'remove') + (extraDebugInfo ? ' (' + extraDebugInfo + ')' : ''))
    }
    // append medias if neccessary
    if (!append && !ignoreMedias) {
      var medias = node.find(tagsOfMedia)
      if (medias.length > 0) {
        article.append(medias)
      }
    }
  })

  if (!options.keepAllLinks) {
    article.find('a+a+a').each(function () {
      var node = $(this)
      var parent = node.parent()
      if (!parent || parent.length === 0 || parent.is(article)) {
        return
      }
      var reg = regexps.uselessAnchors
      var prev
      if (reg.test(node.text() || '') || reg.test((prev = node.prev()).text() || '') || reg.test(prev.prev().text() || '')) {
        parent.remove()
        if (debugDo.enabled) {
          var na = getNodeAttr(parent)
          debugDo('    ∟ <' + na.tagName + ' /> ' + na.classAndId)
          debugDo('      ∟ removed \'Cause contains useless anchors')
        }
      }
    })
  }
  // fix links
  readArt.fixLink($, options.uri, article, options)
  return article
}

/**
 * Should use this node as a parent one or not.
 * @param  {Cheerio} node
 * @param  {Object} options
 * @return {}
 */
function shouldUseParent (node, options) {
  return node.get(0).name.toLowerCase() !== 'article' && node.children('p').length < options.minParagraphs
}

function getNBParent (node) {
  var parent = node.parent()
  if (parent && parent.length > 0 && parent.get(0).name.toLowerCase() !== 'body') {
    return parent
  }
  return null
}

/**
 * Fallback if user defines imgFallback.
 * @param  {Mixed} fb
 * @param  {Cheerio} node
 * @return {String}
 */
function parseImgFallback (fb, node, src) {
  switch (typeof fb) {
    case 'boolean':
      return fb && !src ? (node.data('src') || node.attr('data-src')) : null
    case 'function':
      return fb(node, src)
    case 'string':
      if (!src) {
        if (/^data-/i.test(fb)) {
          fb = fb.slice(5)
          return node.data(fb)
        }
        return node.attr(fb)
      }
      return null
    default:
      return null
  }
}

/**
 * Fix link of image and video objects.
 * @param $ dom
 * @param origin the original uri.
 * @param article the article object.
 * @param options
 */
readArt.fixLink = function ($, origin, article, options) {
  if (!origin) {
    return
  }
  debugRd('   ∟ fix links')
  // found elements.
  article.find('a,' + (tagsOfMedia || '')).each(function () {
    var node = $(this)
    if (!node || node.length === 0) {
      return
    }
    var isValid = false
    var propName
    var propVal
    var na = getNodeAttr(node)

    switch (na.tagName) {
      case 'img':
        propVal = node.attr(propName = 'src')
        if (typeof options.imgFallback !== 'undefined') {
          propVal = parseImgFallback(options.imgFallback, node, propVal) || propVal
        }
        isValid = propVal && (propVal.search(regexps.images) !== -1)
        break
      case 'a':
        propVal = node.attr(propName = 'href')
        isValid = true
        break
      default:
        isValid = (node.html().search(regexps.videos) !== -1)
        break
    }

    if (debugDo.enabled) {
      debugDo('    ∟ <' + na.tagName + ' /> ' + na.classAndId)
      debugDo('      ∟ ' + (isValid ? 'valid' : 'invalid'))
    }

    // remove invalid elements.
    if (!isValid) {
      // avoid cheerio bug:
      // node_modules/cheerio/lib/api/manipulation.js:159:26
      // siblings is undefined.
      try {
        node.remove()
      } catch (err) {}
      return
    }

    // fix link.
    if (propName && propVal) {
      var propURI = URI(propVal)
      if (propURI.is('relative')) {
        propVal = propURI.absoluteTo(origin).href()
      }
      node.attr(propName, propVal)
    }
  })
}

/**
 * every node in candidates get a specified weight.
 * @param node the node element.
 * @param cans candidates array.
 * @param options options.
 */
function getNodeWeight (node, cans, options) {
  debugDo('∟ get node weight')
  // Add the score to the parent. The grandparent gets half
  var parent = node.parent()

  // if parent not exists, break.
  if (parent && parent.length === 0) {
    return debugDo('  ∟ no parent, removed')
  }

  var text = node.text().trim()
  var textLen = text.length
  var imgLen = 0
  // if this paragraph is less than [minTextLength] characters and contains no image, don't even count it.
  if (textLen < options.minTextLength && (!options.scoreImg || (imgLen = node.find('img').length) === 0)) {
    if (debugDo.enabled) {
      debugDo('  ∟ length of text content (%d) is less than %d and contains no image, removed', textLen, options.minTextLength)
    }
    return
  }

  var score = 1
  // add points for any commas within this paragraph.
  var commas = text.match(regexps.commas)
  if (commas && commas.length) {
    score += commas.length
  }
  // for every 100 characters in this paragraph, add another point. up to 3 points.
  score += Math.min(Math.floor(text.length / 100), 3)
  if (options.scoreImg) {
    score += imgLen
  }
  // add the score to the parent and the grandparent gets half.
  scoreNode(parent, score, cans, options.scoreRule)

  var grandParent = parent.parent()
  if (grandParent && grandParent.length > 0) {
    var dampedScore = score * (!isNaN(options.damping) ? parseFloat(options.damping) : (1 / 2))
    dampedScore = !isNaN(dampedScore) ? parseFloat(dampedScore) : 0
    scoreNode(grandParent, dampedScore, cans, options.scoreRule)
  }
}

/**
 * Add score to the node.
 * @param node the node element.
 * @param score score bonus.
 * @param cans candidates.
 * @param scoreRule function of scoring.
 */
function scoreNode (node, score, cans, scoreRule) {
  if (debugDo.enabled) {
    var na = getNodeAttr(node)
    debugDo('  ∟ <' + na.tagName + ' /> ' + na.classAndId)
  }
  if (!node.data(scoreKey)) {
    score += initNode(node)
    cans.push(node)
  } else {
    score += node.data(scoreKey)
  }
  if (typeof scoreRule === 'function') {
    var sr = scoreRule(node)
    score += !isNaN(sr) ? parseFloat(sr) : 0
    debugDo('    ∟ apply score rule')
  }
  if (debugDo.enabled) {
    debugDo('    ∟ final score is ' + score)
  }
  node.data(scoreKey, score)
}

/**
 * Get a node's score by regular expressions.
 * @param node the node element.
 * @return {Number}
 */
function getClassScore (node) {
  var score = 0

  var classAndId = getNodeAttr(node).classAndId
  if (classAndId.search(regexps.negative) >= 0) {
    debugDo('    ∟ negative -25')
    score -= 25
  }
  if (classAndId.search(regexps.positive) >= 0) {
    debugDo('    ∟ positive +25')
    score += 25
  }

  if (debugDo.enabled) {
    debugDo('    ∟ calculated score by class is ' + score)
  }

  return score
}

/**
 * Get the density of links as a percentage of the content.
 * @param {Cheerio} $ dom
 * @param {Cheerio} node the node element.
 * @param {Object} options including:
 *                         {Boolean} strict a value indicates whether or not text length must be calculated.
 *                         {Boolean} textOnly a value indicates whether or not grep the text only,
 *                                             `false` by default will grep title attr if text does not exist.
 * @return {Number}
 */
function getLinkDensity ($, node, options) {
  options = options || {}
  var nodeText = node.text()
  if (!nodeText) {
    return 0
  }
  var textLen = nodeText.replace(/[\r\n\t\s]+/g, '').length
  if (textLen === 0) {
    return 0
  }
  var linkLen = 0
  node.find('a').each(function () {
    var anchor = $(this)
    var href = anchor.attr('href')
    if (!href || href[0] === '#') {
      return
    }
    var text = anchor.text()
    if (!text && !options.textOnly) {
      text = anchor.attr('title')
    }
    var len = 0
    if (text) {
      len = text.replace(/[\r\n\t\s]+/g, '').length
    }
    if (options.strict && len === 0) {
      var children
      if ((children = anchor.children()).length === 1 && children.get(0).tagName === 'img') {
        len = (children.attr('alt') || children.attr('title') || '').length
      }
      if (len === 0) {
        len = href.length
      }
      textLen += len
    }
    linkLen += len
  })
  return linkLen / textLen
}

/**
 * Get a node's weight by its tag.
 * @param node the node element.
 * @return {Number}
 */
function getTagScore (node) {
  var score = 0
  switch (node.get(0).name.toLowerCase()) {
    case 'article':
      score = 20
      break
    case 'section':
      score = 15
      break
    case 'div':
      score = 5
      break

    case 'pre':
    case 'td':
    case 'blockquote':
      score = 3
      break

    case 'address':
    case 'ul':
    case 'ol':
    case 'li':
    case 'dl':
    case 'dd':
    case 'dt':
    case 'form':
      score = -3
      break

    case 'body':
    case 'th':
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      score = -5
      break
  }

  if (debugDo.enabled) {
    debugDo('    ∟ calculated score by tag is ' + score)
  }

  return score
}

/**
 * initialize the node with different bonus.
 * @param node the node element.
 * @return {*}
 */
function initNode (node) {
  var score = 0
  if (!node || node.length === 0) return score
  // get score according its tag, class and ids
  score = getTagScore(node) + getClassScore(node)

  if (debugDo.enabled) {
    debugDo('    ∟ initialization is ' + score)
  }

  return score
}

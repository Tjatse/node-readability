"use strict";

var URI  = require('urijs'),
    util = require('util'),
    entities = require('entities');

var scoreKey    = 'read-art-score',
    extBonusKey = 'read-art-extra-bonus',
    unlikelyKey = 'read-art-unlikely-candidate',
    regexps     = {
      stopwords: /[\.。:：!！;；?？、](\s|$)/,
      videos   : /(youtube|vimeo|youku|tudou|56|letv|iqiyi|sohu|sina|163)\.(com|com\.cn|cn|net)/i,
      images   : /\.(gif|jpe?g|png)$/i,
      commas   : /[,，.。;；?？、]/g
    },
    extRegexps  = {
      positive: /article|blog|body|content|entry|main|news|pag(?:e|ination)|post|story|text/i,
      negative: /com(?:bx|ment|-)|contact|comment|captcha|foot(?:er|note)?|link|masthead|media|meta|outbrain|promo|related|scroll|shoutbox|sidebar|sponsor|util|shopping|tags|tool|widget|tip|dialog|copyright|bottom/i,
      unlikely: /agegate|auth?or|bookmark|cat|com(?:bx|ment|munity)|date|disqus|extra|foot|header|ignore|link|menu|nav|pag(?:er|ination)|popup|related|remark|rss|share|shoutbox|sidebar|similar|social|sponsor|teaserlist|time|tweet|twitter|\bad[\s_-]?\b/i,
      maybe   : /and|article|body|column|main|column/i,
      div2p   : /<(a|blockquote|dl|div|img|ol|p|pre|table|ul)/i
    },
    tagsToSkip  = '';

// read article.
module.exports = readArt;

/**
 * Default settings.
 */
function defSettings(){
  tagsToSkip = 'aside,footer,label,nav,noscript,script,link,meta,style,select,textarea,iframe';
  util._extend(regexps, extRegexps);
}

defSettings();

/**
 * Read article.
 * @param $
 * @param options
 * @returns {*}
 */
function readArt($, options){
  // 1st. node prepping, trash node that look cruddy, and
  //      turn divs into P's where they have been used in appropriately .
  var cans = getCandidates($, options);

  // 2nd. loop through all of the possible candidate nodes we found
  //      and find the one with the highest score.
  var topCandidate = getTopCandidate($, cans);

  // 3nd. grab article
  if (topCandidate && topCandidate.length > 0) {
    return grabArticle($, topCandidate, options);
  } else {
    return null;
  }
}

/**
 * Customize settings.
 * @param fn
 */
readArt.use = function(fn){
  var ctx = {
    reset   : defSettings,
    skipTags: function(tags, override){
      tagsToSkip = override ? tags : (tagsToSkip + ',' + tags)
    },
    regexps : {}
  };
  Object.keys(extRegexps).forEach(function(key){
    ctx.regexps[key] = function(re, override){
      regexps[key] = override ? (typeof re1 == 'string' ? new RegExp(re, 'i') : re) :
        new RegExp('(' + re.source + ')|(' + extRegexps[key].source + ')', 'i');
    }
  });
  fn.call(ctx);
};

/**
 * Read selector.
 * @param  {Mixed} selector       
 * @param  {Mixed} defaultExtract 
 * @return {[type]}               
 */
readArt.selector = function (selector, defaultExtract) {
  if (typeof selector == 'string') {
    selector = {
      selector: selector,
      extract: defaultExtract
    };
  }

  if (typeof selector.selector != 'string') {
    return null;
  }
  if (!selector.extract) {
    selector.extract = defaultExtract;
  }
  return selector;
};
/**
 * Extract data from cheerio object.
 * @param  {cheerio} $      
 * @param  {cheerio} nodes  
 * @param  {Mixed} extract
 * @param  {Object} options
 * @return {[type]}       
 */
readArt.extract = function ($, nodes, extract, options) {
  var data = [];

  options = options || {};
  options.mapping = true;
  nodes.each(function () {
    var node = $(this),
      item,
      isArray = Array.isArray(extract),
      isObject,
      props;

    if (isArray) {
      props = extract;
    } else {
      isObject = Object.prototype.toString.call(extract) == '[object Object]';
      if (isObject) {
        props = Object.keys(extract);
      }
    }


    if (isArray || isObject) {
      props.forEach(function (mapping) {
        var prop = mapping;
        if (isObject) {
          prop = extract[mapping];
        }
        if (typeof prop != 'string') {
          return;
        }
        var it = readArt.extractProp($, node, prop, options);
        if (it) {
          (item = item || {})[mapping] = it;
        }
      });
    } else {
      item = readArt.extractProp($, node, extract, options);
    }
    if (Array.isArray(item)) {
      data = data.concat(item);
    } else if (item) {
      data.push(item);
    }
  });
  if (data.length == 1 && (nodes.length == 1 || typeof data[0] == 'string')) {
    return data[0];
  }
  if(!data.some(function(d){
    return typeof d != 'string';
  })){
    return data.join(' ');
  }
  return data;
};

/**
 * Extract property.
 * @param  {cheerio} $ 
 * @param  {cheerio} node 
 * @param  {String} propName
 * @param  {Object} options
 * @return {[type]}      [description]
 */
readArt.extractProp = function ($, node, propName, options) {
  switch (propName) {
    case 'text':
      return readArt.extractor.text($, node, {break: true, stripSpaces: true}, options);
    case 'html':
      return readArt.extractor.html($, node, {stripSpaces: true}, options);
    case 'cheerio':
      return node;
    case 'json':
      return readArt.extractor.json($, node, {stripSpaces: true}, options);
    default:
      return node.attr(propName);
  }
};

readArt.extractor = {
  json: function($, nodes, output, options){
    var retVal = [],
      textOptions = {escapeBreak: true, break: true, stripSpaces: true};
    nodes.each(function(){
      var node = $(this),
        children = node.children();
      // if only one dom node, return the innerText.
      if (children.length == 0) {
        retVal.push({
          type: 'text',
          value: readArt.extractor.text($, node, output, textOptions)
        });
        return;
      }
      children.each(function () {
        var child = $(this);
        if (child.length == 1 && child.get(0).name == 'img') {
          // find images.
          var src;
          if (src = child.attr('src')) {
            retVal.push({
              type: 'img',
              value: src
            });
          }
        } else {
          // find images.
          child.find('img').each(function () {
            var img = $(this),
              src;
            if ((src = img.attr('src'))) {
              retVal.push({
                type: 'img',
                value: src
              });
            }
          });
          //find text.
          var text = readArt.extractor.text($, child, output, textOptions);
          if (text && text.trim().length > 0) {
            if (output.break) {
              text.split('\\n').forEach(function (txt) {
                if (txt && txt.trim().length > 0) {
                  retVal.push({
                    type: 'text',
                    value: txt
                  });
                }
              });
            } else {
              retVal.push({
                type: 'text',
                value: text
              });
            }
          }
        }
      });
    });
    return retVal;
  },
  text: function($, nodes, output, options){
    var text = '';
    nodes.each(function(){
      var node = $(this);
      if (output.break) {
        node.html(node.html().replace(/<br[^\/>]*\/?>/ig, '\\n'));
      }
      var txt = node.text().trim();
      if (output.stripSpaces) {
        txt = txt.replace(/\s(\s+)/g, ' ').replace(/[\r\t]/g, '').replace(/\n(\n+)/g, '\\n');
      }
      text += entities.decode(txt) + ' ';
    });

    return text.trim();
  },
  html: function($, nodes, output, options){
    var html = nodes.html();
    // strip tab symbols(\r\t\n)
    if (output.stripSpaces) {
      html = html.replace(/([\r\t\n]+)/g, ' ');
    }
    html = entities.decode(html);
    if (options.tidyAttrs) {
      try {
        html = html.replace(/<([a-z][a-z0-9]*)(?:[^>]*(\s(?:src|href)=['\"][^'\"]*['\"]))?[^>]*?(\/?)>/ig, '<$1$2$3>');
      } catch (err) {}
    }
    return html;
  },
  cheerio: function($, nodes){
    return nodes;
  }
};


/**
 * Get scored candidates from paragraphs.
 * @param $ dom
 * @param options options
 * @return {Array}
 */
function getCandidates($, options){
  // remove useless tags.
  $(tagsToSkip).remove();

  var cans = [];
  $('div,p', 'body').each(function(){
    var node = $(this);
    // make sure node exists.
    if (!node || node.length == 0) {
      return;
    }

    // remove element that invisible.
    if (node.css('display') == 'none' || node.css('visibility') == 'hidden') {
      node.remove();
      return;
    }

    // use blank to separate class and id to avoid incorrect operation, e.g.:
    // <div id="side" class="bar>...., the class_Id var will be sidebar, so, it make
    // this node match regexps.unlikely, will be dropped, WTF...
    var classAndId = [node.attr('class') || '', node.attr('id') || ''].join(' ');
    if (classAndId.search(regexps.unlikely) >= 0 && classAndId.search(regexps.maybe) < 0) {
      var parent = node.parent();
      (parent && parent.length > 0) && parent.addClass(unlikelyKey);
      node.remove();
      return;
    }

    var tagName = node.get(0).name.toLowerCase();

    // remove element that has no content.
    if (tagName === 'div' && node.contents().length < 1 && !node.text().trim()) {
      node.remove();
      return;
    }
    // turn all divs that don't have children block level elements into p's
    if (tagName === "div") {
      // cache nodeHTML here.
      var nodeHTML;
      if ((nodeHTML = node.html()).search(regexps.div2p) < 0) {
        node.replaceWith('<p class="' + extBonusKey + '">' + nodeHTML + '</p>');
        nodeHTML = null;
      } else {
        node.contents().each(function(){
          var child = $(this);
          if (!child || child.length == 0) {
            return;
          }
          // cache innerText here.
          var childDom = child.get(0), innerText;
          if (childDom.type == 'text' && (innerText = childDom.data.trim())) {
            child.replaceWith('<p class="' + extBonusKey + '">' + innerText + '</p>');
            innerText = null;
          }
        });
      }
    } else if (tagName === 'p') {
      // loop through all P's, and assign a score to them.
      getNodeWeight(node, cans, options);
    }
  });
  // assign scores to `P`s that were turned from DIV by us.
  $('p.' + extBonusKey, 'body').each(function(){
    getNodeWeight($(this), cans, options);
  });
  return cans;
}

/**
 * Get the highest score candidate node.
 * @param $ dom
 * @param cans candidates
 * @return {*|jQuery|HTMLElement}
 */
function getTopCandidate($, cans){
  var topCandidate = null;
  cans.forEach(function(node){
    var score = node.data(scoreKey) || 0;
    score = score * (1 - getLinkDensity($, node));
    node.hasClass(unlikelyKey) && (score -= 10);
    node.data(scoreKey, score);
    if (!topCandidate || score > topCandidate.data(scoreKey)) {
      topCandidate = node;
    }
  });

  // if we still have not top candidate, just use the body as a last resort.
  return topCandidate || $('body');
}

/**
 * Grab article content from node.
 * @param $ dom
 * @param topCandidate the node element.
 * @param options optional settings
 */
function grabArticle($, topCandidate, options){
  var article = $('<div id="read-art"></div>'),
      siblingScoreThreshold = Math.max(10, topCandidate.data(scoreKey) * 0.2),
      parent, siblings;
  if (topCandidate.children('p').length < 3 && (parent = topCandidate.parent()) && parent.length > 0 && parent.get(0).name.toLowerCase() != 'body') {
    // 1. topCandidate has not enough [P] children
    // 2. parent exist and not [BODY]
    siblings = parent.children();
  } else {
    // self children.
    siblings = topCandidate.children();
  }
  siblings.each(function(){
    var node = $(this),
        tagName = node.get(0).name.toLowerCase(),
        append = false;
    if (node.is(topCandidate) || (node.data(scoreKey) || 0) > siblingScoreThreshold) {
      append = true;
    }
    if (!append) {
      var text = node.text().trim(),
          textLen = text.length;

      if (tagName == 'p') {
        var linkDensity = getLinkDensity($, node);
        if (textLen > 80 && linkDensity < 0.25) {
          append = true;
        } else if ((textLen < 80 && linkDensity == 0) || text.search(regexps.stopwords) !== -1) {
          // end with .|。 commas must be a paragraph.
          append = true;
        }
      } else if ((tagName == 'span' || tagName == 'font') && textLen > 0) {
        append = true;
      }
    }
    if (append) {
      // remove useless attribute
      node.removeAttr('style');
      node.removeAttr('id');
      node.removeAttr('class');
      // remove comments.
      node.contents().filter(function(index, ele){
        return ele.type === 'comment';
      }).remove();

      article.append(node);
    }
    // append medias.
    if (!append) {
      var medias = node.find('img,object,embed');
      if (medias.length > 0) {
        article.append(medias);
      }
    }
  });
  // fix links
  fixLink($, options.uri, article, options);
  return article;
}

/**
 * Fallback if user defines imgFallback.
 * @param  {Mixed} fb
 * @param  {Cheerio} node
 * @return {String}
 */
function parseImgFallback(fb, node) {
  switch (typeof fb) {
    case 'boolean':
      return fb ? (node.data('src') || node.attr('data-src')) : null;
    case 'function':
      return fb(node);
    case 'string':
      if(/^data-/i.test(fb)){
        fb = fb.slice(5);
        return node.data(fb);
      }
      return node.attr(fb);
    default:
      return null;
  }
}

/**
 * Fix link of image and video objects.
 * @param $ dom
 * @param origin the original uri.
 * @param article the article object.
 * @param options
 */
function fixLink($, origin, article, options){
  if(!origin){
    return;
  }
  // found elements.
  article.find('img,a,object,embed').each(function(){
    var node = $(this);
    if (!node || node.length == 0) {
      return;
    }
    var isValid = false, propName, propVal;

    switch(node.get(0).name.toLowerCase()){
      case 'img':
        propVal = node.attr(propName = 'src');
        if(!propVal && typeof options.imgFallback != 'undefined'){
          propVal = parseImgFallback(options.imgFallback, node);
        }
        isValid = propVal && (propVal.search(regexps.images) !== -1);
        break;
      case 'a':
        propVal = node.attr(propName = 'href');
        isValid = true;
        break;
      default:
        isValid = (node.html().search(regexps.videos) !== -1);
        break;
    }
    // remove invalid elements.
    if (!isValid) {
      // avoid cheerio bug:
      // node_modules/cheerio/lib/api/manipulation.js:159:26
      // siblings is undefined.
      try {
        node.remove();
      } catch (err) { }
      return;
    }

    // fix link.
    if (propName && propVal) {
      var propURI = URI(propVal);
      if (propURI.is('relative')) {
        propVal = propURI.absoluteTo(origin).href();
      }
      node.attr(propName, propVal);
    }
  });
}

/**
 * every node in candidates get a specified weight.
 * @param node the node element.
 * @param cans candidates array.
 * @param options options.
 */
function getNodeWeight(node, cans, options){
  // Add the score to the parent. The grandparent gets half
  var parent = node.parent();

  // if parent not exists, break.
  if (parent && parent.length == 0) {
    return;
  }

  var text = node.text().trim();

  // if this paragraph is less than [minTextLength] characters, don't even count it.
  if (text.length < options.minTextLength) {
    return;
  }

  var score = 1;
  // add points for any commas within this paragraph.
  var commas = text.match(regexps.commas);
  if (commas && commas.length) {
    score += commas.length;
  }
  // for every 100 characters in this paragraph, add another point. up to 3 points.
  score += Math.min(Math.floor(text.length / 100), 3);
  // add the score to the parent and the grandparent gets half.
  scoreNode(parent, score, cans, options.scoreRule);

  var grandParent = parent.parent();
  if (grandParent && grandParent.length > 0) {
    var dampedScore = score * (isFinite(options.damping) ? options.damping : (1 / 2));
    dampedScore = isFinite(dampedScore) ? dampedScore : 0;
    scoreNode(grandParent, dampedScore, cans, options.scoreRule);
  }
}

/**
 * Add score to the node.
 * @param node the node element.
 * @param score score bonus.
 * @param cans candidates.
 * @param scoreRule function of scoring.
 */
function scoreNode(node, score, cans, scoreRule){
  if (!node.data(scoreKey)) {
    score += initNode(node);
    cans.push(node);
  } else {
    score += node.data(scoreKey);
  }
  if (typeof scoreRule == 'function') {
    var sr = scoreRule(node);
    score += !isNaN(sr) ? sr : 0;
  }
  node.data(scoreKey, score);
}

/**
 * Get a node's weight by regular expressions.
 * @param node the node element.
 * @return {Number}
 */
function getClassWeight(node){
  var weight = 0;

  var classAndId = [node.attr('class') || '', node.attr('id') || ''].join(' ');
  if (classAndId.search(regexps.negative) >= 0) {
    weight -= 25;
  }
  if (classAndId.search(regexps.positive) >= 0) {
    weight += 25;
  }

  return weight;
}

/**
 * Get the density of links as a percentage of the content.
 * @param $ dom
 * @param node the node element.
 * @return {Number}
 */
function getLinkDensity($, node){
  var textLen = node.text().length;
  if (textLen == 0) {
    return 0;
  }
  var linkLen = 0;
  node.find('a').each(function(){
    var anchor = $(this),
        href = anchor.attr('href');
    if (!href || href[0] === '#') {
      return;
    }
    linkLen += anchor.text().length;
  });
  return linkLen / textLen;
}

/**
 * initialize the node with different bonus.
 * @param node the node element.
 * @return {*}
 */
function initNode(node){
  var score = 0;
  if (!node || node.length == 0) return score;

  switch (node.get(0).name.toLowerCase()) {
    case 'article':
      score = 20;
      break;
    case 'section':
      score = 15;
      break;
    case 'div':
      score = 5;
      break;

    case 'pre':
    case 'td':
    case 'blockquote':
      score = 3;
      break;

    case 'address':
    case 'ul':
    case 'ol':
    case 'li':
    case 'dl':
    case 'dd':
    case 'dt':
    case 'form':
      score = -3;
      break;

    case 'body':
    case 'th':
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      score = -5;
      break;
  }

  return score + getClassWeight(node);
}
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
  this.$ = $;
  this.html = $.html();
  this.caches = {};
  this.options = options;

  // return content,title and html wrapped object.
  return {
    __proto: this,
    get content(){
      return this.__proto.getContent();
    },
    get title(){
      return this.__proto.getTitle();
    },
    get html(){
      return this.__proto.html;
    }
  };
}

/**
 * Get content of article.
 * @return {*}
 */
Article.prototype.getContent = function() {
  var content;
  // if cache exists, return it directly.
  if ((content = this.caches['article-content'])) {
    return content;
  }
  // else read it by article reader.
  var node = read(this.$, this.options),
      content;
  if(node && node.length > 0){
    var output = this.options.output;
    if(typeof output == 'string'){
      output = {type: output};
    }
    if(!output.type || ['text', 'json', 'html'].indexOf(output.type) == -1){
      output.type = 'html';
    }
    content = this['contentWith' + output.type.toUpperCase()](node, output);
  }

  this.caches['article-content'] = content;

  return content;
};

/**
 * Get title of article.
 * @return {*}
 */
Article.prototype.getTitle = function() {
  // if cache exists, return it directly.
  var title;
  if ((title = this.caches['article-title'])) {
    return title;
  }
  var nodeTitle = this.$('title');
  // make sure title exists.
  title = (nodeTitle && nodeTitle.length > 0 ? nodeTitle.text().trim() : '');
  if(!title){
    return '';
  }

  title = entities.decode(title);

  // split title by separators.
  var betterTitle = '', subTitles = title.split(/[\|\-–_«»]/g), betterTitleExist = function(t){
    return (t && t.length >= 10);
  };

  // when find better title, break the loop.
  subTitles.forEach(function(t){
    if(betterTitleExist(betterTitle)){
      return false;
    }
    
    t = t.trim();
    if(t){
      betterTitle += ' ' + t;
    }
  });

  // length of better title must gte 10.
  if (betterTitleExist(betterTitle)){
    title = betterTitle.trim();
  }
  // releasing...
  betterTitleExist = null;
  betterTitle = null;

  this.caches['article-title'] = title;

  return title;
};

/**
 * Get innerText of content.
 * @param node the article node.
 * @param output data type including:
 *  type: 'text'
 *  stripSpaces: a value indicating whether strip white spaces, tab symbols(\r\t\n).
 * @return {*|String|String|String|String|String|String|String|Progress}
 */
Article.prototype.contentWithTEXT = function(node, output){
  var text = node.text().trim();
  if(output.stripSpaces){
    text = text.replace(/([\s\r\t\n]+)/g, ' ');
  }
  text = entities.decode(text);
  return text;
};
/**
 * Get innerHTML of content.
 * @param node the article node.
 * @param output data type including:
 *  type: 'html',
 *  stripSpaces: a value indicating whether strip tab symbols(\r\t\n).
 * @return {*}
 */
Article.prototype.contentWithHTML = function(node, output){
  var html = node.html();
  // strip tab symbols(\r\t\n)
  if(output.stripSpaces){
    html = html.replace(/([\r\t\n]+)/g, ' ');
  }
  html = entities.decode(html);
  return html;
};
/**
 * Get formarted JSON of content.
 * @param node the article node.
 * @param dataType data type including:
 *  type: 'json',
 *  stripSpaces: a value indicating whether strip white spaces, tab symbols(\r\t\n).
 * @return {*}
 */
Article.prototype.contentWithJSON = function(node, dataType){
  var children = node.children();
  // if only one dom node, return the innerText.
  if(children.length == 0){
    return {type: 'text', value: this.contentWithTEXT(node, dataType)};
  }
  var self = this, retVal = [];
  children.each(function(){
    var child = self.$(this);
    if(child.get(0).name == 'img'){
      // find images.
      var src;
      if((src = child.attr('src'))){
        retVal.push({type: 'img', value: src});
      }
    }else{
      // find images.
      child.find('img').each(function(){
        var imgNode = self.$(this), src;
        if((src = imgNode.attr('src'))){
          retVal.push({type: 'img', value: src});
        }
      });
      //find text.
      var text = self.contentWithTEXT(child, dataType);
      if(text){
        retVal.push({type: 'text', value: entities.decode(text)});
      }
    }
  });
  return retVal;
};
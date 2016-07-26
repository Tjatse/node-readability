# 2016/07/26
- Update packages, add nodeJS 4 and 6 for Travis and remove unnecesary … @miduga
- Do some refactor and cleaning @miduga
- Merge branch 'cleaning-reader' @miduga
- Fix promises documentation @miduga

# 2016/04/18
- Promise support

# 2016/04/07
- remove useless anchors i.e.: paginations, contactors...
- remove related links if neccessary
- improve link density algorithm
- options recognition
- cheerio object can be passed in
- more test cases

# 2016/03/23
- improve `selectors` option

# 2016/03/21
- improve performance
- fixed typo @entertainyou
- `debug` mode
- `extract` of `selectors` could be `function` now

# 2016/02/22
- `betterTitle` option
- #18 #20 #21 #27 #28

# 2016/01/18
- `forceDecode` option, let `cheerio`/`htmlparser2` handle the encodings now. 

# 2016/01/14
- `minParagraphs` option.
- Make images regexp extendable. #14@entertainyou

# 2016/01/07
- feature: threshold
- fixed: #5 #10

# 2016/01/06
- `imgFallback` option @entertainyou

# 2015/12/29
- fix scoreRule on grandparent node

# 2015/12/18
- only fetch body when uri is provided but html is empty
- fix the links of img,a,object,embed... - relative to absolute
- customize selectors
- refactor: extract data

# 2015/12/09
- Supports `cheerio` output type. @entertainyou

# 2015/10/16
- Add `tidyAttrs` option.

# 2015/06/03
- Add response data to callback arguments

# 2015/03/10
- Remove empty content in JSON output mode
- Split content by `<br />` in JSON output mode

# 2015/01/03
- Custom score rule supports
- Options.minTextLength supports
- Update dependencies

# 2014/11/28
- RexExp of videos
- Update documentation

# 2014/11/05
- Decode HTML entities manually
- Update documentation

# 2014/10/30
- Remove broken test sites
- Update dependencies


# 2014/10/24
- Identify Ads.
- Calculate scores with reducing weight if content has unlikely candidates now.
- Grab article content more accurate.
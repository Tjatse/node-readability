var read = require('../')

read('http://news.163.com/16/0224/23/BGKI6D0M00014PRF.html', {
  timeout: 15000,
  output: {
    type: 'text',
    stripSpaces: true,
    break: true
  },
  selectors: {
    quote: {
      selector: '#ne_article_source',
      extract: {
        link: 'href',
        label: 'text'
      }
    }
  },
  minTextLength: 0,
  scoreRule: function (node) {
    if (node.hasClass('w740')) {
      return 100
    }
    return 0
  }
}, function (err, art, options, resp) {
  if (err) {
    console.log('[ERROR]', err.message)
    return
  }
  if (!art) {
    console.log('[WARNING] article not exist')
    return
  }

  /* eslint-disable no-unused-vars */
  var title = art.title
  var content = art.content
  var quote = art.quote
  /* eslint-enable no-unused-vars */
  console.log(quote)
})

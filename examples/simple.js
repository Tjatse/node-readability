var read = require('../');

read('http://www.cqn.com.cn/auto/news/73572.html', {
  timeout  : 15000,
  output   : {
    type       : 'json',
    stripSpaces: true,
    break: true
  },
  minTextLength: 0,
  scoreRule: function(node){
    if (node.hasClass('w740')) {
      return 100;
    }
    return 0;
  }
}, function(err, art, options, resp){
  if (err) {
    console.log('[ERROR]', err.message);
    return;
  }
  if (!art) {
    console.log('[WARNING] article not exist');
    return;
  }

  console.log('[INFO]', 'title:', art.title);
  console.log('[INFO]', 'content:', art.content);
});
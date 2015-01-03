var read = require('../');

read('http://club.autohome.com.cn/bbs/thread-c-66-37239726-1.html', {
  timeout  : 15000,
  output   : {
    type       : 'text',
    stripSpaces: true
  },
  minTextLength: 0,
  scoreRule: function(node){
    if (node.hasClass('w740')) {
      return 100;
    }
    return 0;
  }
}, function(err, art){
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
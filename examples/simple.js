var read = require('../');

read('http://amanpour.blogs.cnn.com/2014/05/08/defector-shadowy-organization-not-kim-jong-un-controls-north-korea/?hpt=hp_c1', function(err, art){
  if(err){
    console.log('[ERROR]', err.message);
    return;
  }
  if(!art){
    console.log('[WARNING] article not exist');
    return;
  }

  console.log('[INFO]', 'content:', art.content);
  console.log('[INFO]', 'title:', art.title);
});

var read = require('../');

read('http://baike.baidu.com/view/3974030.htm?fr=aladdin', {
    timeout: 15000,
    disableGzip: true,
    output: {
        type: 'html',
        stripSpaces: true
    }
}, function(err, art){
    if(err){
        console.log('[ERROR]', err.message);
        return;
    }
    if(!art){
        console.log('[WARNING] article not exist');
        return;
    }

    console.log('[INFO]', 'title:', art.title);
    console.log('[INFO]', 'content:', art.content);
});
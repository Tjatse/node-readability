
var read = require('../');

read('http://www.bbc.com/sport/0/football/29053651', {
    timeout: 15000,
    dataType: {
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
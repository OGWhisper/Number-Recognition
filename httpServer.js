//This is for my use so I can put the server live locally for me to work on
//As I need it to have the same domain of localhost for localStorage and my Routing to work

const connect = require('connect')
const serveStatic = require('serve-static')

connect()
    .use(serveStatic(`${__dirname}`))
    .listen(4200, () => { console.log('HTTP Server running on 4200...') });
const express = require('express');
const expressHandlebars = require('express-handlebars');
const {credentials} = require('./config');
const expressSession = require('express-session');
const redis = require('redis')
const RedisStore = require('connect-redis')(expressSession)
const redisClient = redis.createClient({url: credentials.redis.url})
const bodyParser = require('body-parser');
const handlers = require('./lib/handlers');
const cookieParser = require('cookie-parser');
const flashMiddleWare = require('./lib/middleware/flashMiddleWare');
const morgan = require('morgan')



const app = express();
//database
require('./lib/db/mongoLink')
require('./lib/db/postgressLink')
//routes
require('./lib/routes')(app)
require('./lib/middleware/autoRenderViews')(app)
function startServer(port) {
    app.listen(port, function() {
        console.log(`Express started in ${app.get('env')} ` +
            `mode on http://localhost:${port}` +
            `; press Ctrl-C to terminate.`)
    })
}


const port = process.env.PORT || 3000;
app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main',
    helpers: {
        section: function(name, options) {
            if (!this._sections) this._sections = {}
            this._sections[name] = options.fn(this)
        },
    }
}));
app.set('view engine', 'handlebars');

switch(app.get('env')){
    case 'production':
        const stream = fs.createWriteStream(__dirname+ '/access.log',
            {flags: 'a'})
        app.use(morgan('combined',{stream: stream}))
        break
    default:
        app.use(morgan('dev'))
}
app.use(cookieParser(credentials.cookieSecret))
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
    store:  new RedisStore({
        client: redisClient,
        logErrors: true,  // highly recommended!
    }),

}))
app.use(flashMiddleWare)

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(handlers.notFound);
app.use(handlers.serverError);

if(require.main === module) {
    startServer(process.env.PORT || 3000)
} else {
    module.exports = startServer;
}

const express = require('express')
const expressHandlebars = require('express-handlebars')
const {credentials} = require('./config')
const expressSession = require('express-session')
const redis = require('redis')
const RedisStore = require('connect-redis')(expressSession)
const redisClient = redis.createClient({url: credentials.redis.url})
const bodyParser = require('body-parser')
const handlers = require('./lib/handlers')
const cookieParser = require('cookie-parser')
const fs = require('fs')
const flashMiddleWare = require('./lib/middleware/flashMiddleWare')
const autoRenderViews = require('./lib/middleware/autoRenderViews')
const morgan = require('morgan')
const api = require('./routes/api')
const app = express()

//database TODO: probably don't neeed both mono and postgress
require('./lib/db/mongoLink')
require('./lib/db/postgressLink')

function startServer(port) {
    app.listen(port, function() {
        console.log(`Express started in ${app.get('env')} ` +
            `mode on http://localhost:${port}` +
            `; press Ctrl-C to terminate.`)
    })
}

app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main',
    helpers: {
        section: function(name, options) {
            if (!this._sections) this._sections = {}
            this._sections[name] = options.fn(this)
        },
    }
}))
app.set('view engine', 'handlebars')
const stream = fs.createWriteStream(__dirname+ '/access.log',
    {flags: 'a'})
switch(app.get('env')){
    case 'production':
        app.use(morgan('combined',{stream: stream}))
        break
    default:
        app.use(morgan('dev'))
        stream.close()
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
app.use(autoRenderViews)
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())


app.get('/', (req,res)=>res.render('home'))
app.use('/api', api)
app.use(handlers.notFound)
app.use(handlers.serverError)

if(require.main === module) {
    startServer(process.env.PORT || 3033)
} else {
    module.exports = startServer
}

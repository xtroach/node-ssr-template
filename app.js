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
ObjectId = require('mongodb').ObjectID;

const autoRenderViews = require('./lib/middleware/autoRenderViews')
const morgan = require('morgan')
const apiRoute = require('./routes/apiRouter')
const userRouter = require('./routes/userRouter')
const twitterQueries = require('./lib/twitterQueries')
const auth = require('./lib/auth')
const app = express()
const UserGitHubData = require('./models/userGitHubData').UserGitHubData
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
    resave: true,
    saveUninitialized: true,
    secret: credentials.cookieSecret,
    store:  new RedisStore({
        client: redisClient,
        logErrors: true,  // highly recommended!
    }),
}))
app.use(flashMiddleWare)


app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(auth.passport.initialize());
app.use(auth.passport.session());
app.use((req,res,next)=>{
    if(req.user) {
        if (!res.locals.loggedUser)
            res.locals.loggedUser = {
            _id: req.user._id ? req.user._id : "",
            authId: req.user.authId ? req.user.authId : "",
            name: req.user.name ? req.user.name : ""
        }
    }
    next()
})




app.get('/', async (req,res)=>{
    res.render('home',{ tweets: await twitterQueries.getLimitedSearchFunction("#corona", {count:3, lang:"de"})() })
})
app.get('/github/commits',  async (req,res)=>{
    const code = (await UserGitHubData.findOne({user_id: req.user._id})).code


    const octokit = await require('./lib/githubQueries')(credentials.authProviders.github, code)
    const commitData= (await octokit.activity.listEventsForUser({username: ObjectId(req.query.user)})).data
    const commitInfos = await Promise.all(

        commitData.map( async (commit)=>{
            const repoOwner = commit.repo.name.split('/')[0];
            const repoName = commit.repo.name.split('/')[1];
            const commitInfo = await octokit.repos.listCommits({owner: repoOwner, repo: repoName})
            return commitInfo
        })
    )
    res.json(commitInfos)
})
app.get('/api/users',(req,res)=>{

    const User = require('mongoose').model('User');
    User.findOne({authId: "github:41797801" }, (err,qres) => res.json(qres))
})
app.use('/api', apiRoute)
app.use('/user', userRouter)



app.get('/tweets', async (req, res) => {
    res.send(await twitterer.getToken());
})
app.get('/auth/github', (req,res,next) =>{
    auth.passport.authenticate('github', function (error, user,info) {
    })(req,res,next)
});

app.get('/auth/twitter',(req,res,next) => {
    auth.passport.authenticate('twitter',
        function (err, user, info) {
            console.log("After")(req,res,next)
    })
})

app.get('/auth/twitter/callback',
    auth.passport.authenticate('twitter', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/user/profile');
    });
app.get('/auth/github/callback', auth.passport.authenticate('github', { failureRedirect: '/login' }),
    async function(req, res) {

        const newCode = await UserGitHubData.findOneAndUpdate({ user_id: req.user._id},{code: req.query.code}, {new: true, upsert: true}, (err,doc)=>{if (err) throw (err)})
        res.redirect('/user/profile');
    });

app.use(autoRenderViews)
app.use(express.static(__dirname + '/public'))
app.use(handlers.notFound)
app.use(handlers.serverError)

if(require.main === module) {
    startServer(process.env.PORT || 3033)
} else {
    module.exports = startServer
}

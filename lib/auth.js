const passport = require('passport')
const TwitterStrategy = require('passport-twitter')

const db = require('../lib/db/mongoLink')

passport.serializeUser((user, done) => (null, user.id))
passport.deserializeUser((id, done) =>{
    db.getUserById(id)
        .then(user => done(null,err))
        .catch(err => done(err,null))
    }
)

module.exports = (app, options) => {
    // if success and failure redirects aren't specified,
    // set some reasonable defaults
    if (!options.successRedirect) options.successRedirect = '/account'
    if (!options.failureRedirect) options.failureRedirect = '/login'
    return {
        init: function () { /* TODO */
            var config = options.providers

            // configure Facebook strategy
            passport.use(new TwitterStrategy({
                consumerKey: config.twitter.appId,
                consumerSecret: config.twitter.appSecret,
                callbackURL: (options.baseUrl || '') + 'auth/twitter/callback',
            }, (accessToken, refreshToken, profile, done) => {
                const authId = 'twitter:' + profile.id
                db.getUserByAuthId(authId)
                    .then(user => {
                        if(user) return done(null, user)
                        db.addUser({
                            authId: authId,
                            name: profile.displayName,
                            created: new Date(),
                            role: 'customer',
                        })
                            .then(user => done(null, user))
                            .catch(err => done(err, null))
                    })
                    .catch(err => {
                        if(err) return done(err, null);
                    })
            }))

            app.use(passport.initialize())
        },
        registerRoutes: () => {
            app.get('/auth/twitter', (req, res, next) => {
                if(req.query.redirect) req.session.authRedirect = req.query.redirect
                passport.authenticate('twitter')(req, res, next)
            })
            app.get('/auth/twitter/callback', passport.authenticate('twitter',
                { failureRedirect: options.failureRedirect }),
                (req, res) => {
                    // we only get here on successful authentication
                    const redirect = req.session.authRedirect
                    if(redirect) delete req.session.authRedirect
                    res.redirect(303, redirect || options.successRedirect)
                }
            )
        },
    }
}
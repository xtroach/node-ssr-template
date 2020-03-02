const passport = require('passport')
const User = require('mongoose').model('User');
const authProviders = require('../config').credentials.authProviders;
const twitterCredentials = authProviders.twitter;
const githubCredentials = authProviders.github;
const gitHubData = require('../models/userGitHubData')
const TwitterStrategy = require('passport-twitter').Strategy
const GitHubStrategy = require('passport-github').Strategy


async function gitHubAuthCallback(accessToken, refreshToken, user, cb) {

    User.findOne({authId: "github:" + user.id },(err,qres)=> {
        if (err) return cb(err)
        if (qres) {
            gitHubData.findOneAndUpdate({user_id: qres._id},{accessToken: accessToken}, {upsert: true},(err,res) =>{
                if (err) return cb(err)
            })
            return cb(null, qres)
        }

        User.create({name: user.username, authId: "github:" + user.id},(err, qres)=>{
            if (err) return cb(err)
            gitHubData.findOneAndUpdate({user_id: qres._id},{accessToken: accessToken}, {upsert: true},(err,res) =>{
                if (err) return cb(err)
            })
            cb(null, qres)
        })
    })





}

async function twitterAuthCallback(accessToken, refreshToken, user, cb) {
    User.findOne({authId: "twitter:" + user.id },(err,qres)=> {
        if (err) return cb(err)
        if (qres) return cb(null, qres)

        User.create({name: user.displayName, authId: "twitter:" + user.id},(err, qres)=>{
            if (err) return cb(err)
            cb(null, qres)
        })


    })
}

passport.use(new GitHubStrategy(githubCredentials,gitHubAuthCallback))
passport.use(new TwitterStrategy(twitterCredentials, twitterAuthCallback))


passport.serializeUser(function(user, cb) {
    cb(null, user._id);
});

passport.deserializeUser(function(id, cb) {

    User.findOne({_id: id},(err,qres)=>{
        cb(null, qres)
    })
});

module.exports.passport = passport
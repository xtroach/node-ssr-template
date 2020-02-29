const options = require('../../config').credentials.authProviders.twitter;
const createTwitterClient = require("../twitterConnection")(options)



module.exports = {
    getTweets: createTwitterClient,
}
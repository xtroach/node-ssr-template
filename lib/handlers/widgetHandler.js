const options = require('../../config').credentials.authProviders.twitter;
const createTwitterClient = require("../../lib/twitter")(options)



module.exports = {
    getTweets: createTwitterClient,
}
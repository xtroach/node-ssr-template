const twitterConnection = require('./twitterConnection.js')
const twitterCredentials = require('../config').credentials.authProviders.twitter;
const twitterer = twitterConnection(twitterCredentials)


module.exports.getLimitedSearchFunction = (search, parameters, displayParameters) => {
    const topTweets = {
        lastRefreshed: 0,
        refreshInterval: 15 * 60 * 1000,
        tweets: [],
    }


    const count = parameters.count;
    parameters.count = 20*count;
    let suitedTweets = 0
    return async () => {

        const indexedTweets = {};
        if(Date.now() > topTweets.lastRefreshed + topTweets.refreshInterval) {
            const tweets =
                await twitterer.search(search, parameters)
            const formattedTweets = await Promise.all(
                tweets.statuses.map(async (tweet) => {
                    if (indexedTweets[tweet.id]  || tweet.retweeted_status  || suitedTweets >=  count) return ""
                    indexedTweets[tweet.id]= true
                    suitedTweets++
                    const url = `https://twitter.com/${tweet.user.id_str}/statuses/${tweet.id_str}`
                    const embeddedTweet =
                        await twitterer.embed({url: url})
                    return embeddedTweet.html
                })
            )
            topTweets.lastRefreshed = Date.now()
            topTweets.tweets = formattedTweets.join('');
        }
        return topTweets.tweets
    }
};
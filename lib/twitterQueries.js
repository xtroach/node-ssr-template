const twitterConnection = require('./twitterConnection.js')
const twitterCredentials = require('../config').credentials.authProviders.twitter;
const twitterer = twitterConnection(twitterCredentials)


module.exports.getLimitedSearchFunction = (search, parameters, displayParameters) => {
    const topTweets = {
        lastRefreshed: 0,
        refreshInterval: 15 * 60 * 1000,
        tweets: [],
    }

    const displayDefaults = {
        omit_script: 1,
        hide_media: 1
    }
    return async () => {
        if(Date.now() > topTweets.lastRefreshed + topTweets.refreshInterval) {
            const tweets =
                await twitterer.search(search, parameters)
            const formattedTweets = await Promise.all(
                tweets.statuses.map(async ({ id_str, user }) => {
                    const url = `https://twitter.com/${user.id_str}/statuses/${id_str}`
                    const embeddedTweet =
                        await twitterer.embed(url, Object.assign(displayDefaults, displayParameters))
                    return embeddedTweet.html
                })
            )
            topTweets.lastRefreshed = Date.now()
            topTweets.tweets = formattedTweets.join()
        }
        return topTweets.tweets
    }
};
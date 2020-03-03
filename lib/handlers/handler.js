const {UserGitHubData} = require('../db/mongoLink')
const {credentials} = require('../../config')
module.exports.gitHubCommits = async() => {

    const resultCache = {
        lastRefreshed: 0,
        refreshInterval: 15 * 60 * 1000,
        cache: [],
    }

    return async function(req,res) {
        if (Date.now() < resultCache.lastRefreshed + resultCache.refreshInterval) return resultCache.cache
        let accessToken = null
        if (req.user) {
            accessToken = (await UserGitHubData.findOne({user_id: req.user._id}).catch(()=>accessToken=null)
            ).accessToken
        }
        let octokit;
        if (accessToken)
            octokit = await require('../githubQueries')(credentials.authProviders.github, accessToken)
        else {
            octokit = await require('../githubQueries')(credentials.authProviders.github)
        }

        const results = await octokit.repos.listCommits({owner: 'xtroach', repo: "node-server-template"})
        resultCache.cache = results
        return results

    }

}

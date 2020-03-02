const options = require('../../config').credentials.authProviders.twitter;
const createTwitterClient = require("../twitterConnection")(options)

async function gitHubCommits(){
const accessToken = (await UserGitHubData.findOne({user_id: req.user._id},(err,res)=>{if (err) throw err})).accessToken
const octokit = await require('./lib/githubQueries')(credentials.authProviders.github, accessToken)
octokit.activity.listEventsForUser({username: req.user.name}).then(
    async ( data)=>{

        const commitInfo = await Promise.all(
            data.data.map(
                async (commit)=>{
                    let repoDetails = null;
                    repoDetails = await octokit.request(`GET /repositories/${commit.repo.id}`).catch(()=> repoDetails = null)

                    return repoDetails
                }
            )
        )


        res.json(commitInfo)



    })
}
module.exports = {
    getTweets: createTwitterClient,
}
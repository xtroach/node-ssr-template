const { Octokit } = require("@octokit/rest");
const retry = require('@octokit/plugin-retry')
const throttling = require('@octokit/plugin-throttling')




module.exports =  async (credentials, accessToken) => {

    const octokit = new Octokit({
        userAgent: 'myApp v1.2.3',
        previews: ['jean-grey', 'symmetra'],
        timeZone: 'Europe/Amsterdam',
        baseUrl: 'https://api.github.com',
        log: {
            debug: () => {
            },
            info: () => {
            },
            warn: console.warn,
            error: console.error
        },
        plugin: [retry,throttling],
        auth: accessToken
    })

    return octokit
}












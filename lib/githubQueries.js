const { Octokit } = require("@octokit/rest");
const { createAppAuth } = require("@octokit/auth-app");
const {createOAuthAppAuth} =  require("@octokit/auth");
const retry = require('@octokit/plugin-retry')
const throttling = require('@octokit/plugin-throttling')




module.exports =  async (credentials, code) => {

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
        plugin: [retry,throttling]

    })

    if (code) {
        const auth = createOAuthAppAuth({
            clientId: credentials.clientID,
            clientSecret: credentials.clientSecret,
            code: code // code from OAuth web flow, see https://git.io/fhd1D
        });
        const tokenAuthentication = await auth({type: "token"})

        octokit.auth = tokenAuthentication;
    }
    return octokit
}












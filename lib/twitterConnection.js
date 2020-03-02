const https = require('https')
const qs = require('querystringify')

module.exports = (twitterOptions) =>{



    let accessToken = null

    const getAccessToken = async () => {
        if (accessToken) return accessToken
        const bearerToken = Buffer(
            encodeURIComponent(twitterOptions.consumerKey) + ':' +
            encodeURIComponent(twitterOptions.consumerSecret)
        ).toString('base64')


        const options = {
            hostname: 'api.twitter.com',
            port: 443,
            method: 'POST',
            path: '/oauth2/token?grant_type=client_credentials',
            headers: {
                'Authorization': 'Basic ' + bearerToken,
            },
        }

        return new Promise((resolve, reject) =>
            https.request(options, res => {
                let data = ''
                res.on('data', chunk => data += chunk)
                res.on('end', () => {
                    const auth = JSON.parse(data)
                    if (auth.token_type !== 'bearer')
                        return reject(new Error('Twitter auth failed.'))
                    accessToken = auth.access_token
                    return resolve(accessToken)
                })
            }).end()
        )


    }


    return {
        search: async (query, parameters) => {
            const accessToken = await getAccessToken()
            const basePath = '/1.1/search/tweets.json?q=' + encodeURIComponent(query)
            const requestSubfix = Object.entries(parameters).map(([key,value])=> {
                return '&' + encodeURIComponent(key) +'=' + encodeURIComponent(value)
            }).join("")
            const fullPath= basePath+requestSubfix

            const options = {
                hostname: 'api.twitter.com',
                port: 443,
                method: 'GET',
                path: fullPath,
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                },
            }
            return new Promise((resolve, reject) =>
                https.request(options, res => {
                    let data = ''
                    res.on('data', chunk => data += chunk)
                    res.on('end', () => resolve(JSON.parse(data)))
                }).end()
            )
        },
        embed: async (options={}) => {

            const displayDefaults = {
                omit_script: 1,
                hide_media: 1
            }

            const displayOptions = Object.assign(displayDefaults, options)
            const accessToken = await getAccessToken()
            const requestOptions = {
                hostname: 'api.twitter.com',
                port: 443,
                method: 'GET',
                path: '/1.1/statuses/oembed.json?' + qs.stringify(displayOptions),
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                },
            }


            console.log(requestOptions.path)

            return new Promise((resolve, reject) =>
                https.request(requestOptions, res => {
                    let data = ''
                    res.on('data', chunk => data += chunk)
                    res.on('end', () => resolve(JSON.parse(data)))
                }).end()
            )
        },
    }
}

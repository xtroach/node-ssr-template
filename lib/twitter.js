const https = require('https')

module.exports = (options) =>{



    let accessToken = null

    let localOpts = options
    const getAccessToken = async () => {
        if (accessToken) return accessToken
        const bearerToken = Buffer(
            encodeURIComponent(localOpts.consumerKey) + ':' +
            encodeURIComponent(localOpts.consumerSecret)
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
        getToken: (async () =>{
            const token = await getAccessToken()
            return token;
        }),


    }

}

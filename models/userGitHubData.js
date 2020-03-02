const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userGitHubDataSchema = new Schema({
    accessToken: String,
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})


const UserGitHubData= mongoose.model('UserGitHubData', userGitHubDataSchema)
module.exports =  UserGitHubData
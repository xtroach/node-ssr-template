const mongoose = require('mongoose', { useNewUrlParser: true})
const {credentials} = require('../../config');
const { connectionString } = credentials.mongo;
const User = require('../../models/user')
if (!connectionString){
    console.error("MongoDB connection string missing!")
    process.exit(1)
}
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const mongoLink = mongoose.connection
mongoLink.on('error', err=>{
    console.error("MongoDB error: " + err.message);
})
mongoLink.once('open', () => console.log('MongoDB connection established'))

function abstractFromDatabase(model){
    return {
        findOne : (async function() {
            return model.findOne(...arguments).lean()
        }),
        findMany : (async function() {
            return model.findMany(...arguments).lean()
        })
        //... more primitive functions here
    }
}

module.exports.User = abstractFromDatabase(User)
//adding functions specific to model here
module.exports.User.getAllRelatedUsers = (async function() {
    //...

})
//...export more database functionality

const mongoose = require('mongoose', { useNewUrlParser: true})
const Vacation = require('../../models/vacation')
const VacationInSeasonListener = require('../../models/vacationInSeasonListener')
const {credentials} = require('../../config');
const { connectionString } = credentials.mongo;
const User = require('../../models/user')
if (!connectionString){
    console.error("MongoDB connection string missing!")
    process.exit(1)
}
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
const mongoLink = mongoose.connection
mongoLink.on('error', err=>{
    console.error("MongoDB error: " + err.message);
})
mongoLink.once('open', () => console.log('MongoDB connection established'))

module.exports = {
    getVacationListeners: async () => VacationInSeasonListener.find(),
    getVacations: async (options = {}) => Vacation.find(options),
    addVacationInSeasonListener: async (sku,email) => {
        return await VacationInSeasonListener.updateOne(
            {email},
            {$push: {skus: sku}},
            {upsert: true}
        )
    },
    requestDeleteVacationInSeasonListener: async (email)=>{
            return await VacationInSeasonListener.deleteOne({email: email})
    },


    getUserById: async id => User.findById(id),
    getUserByAuthId: async authId => User.findOne({ authId }),
    addUser: async data => new User(data).save(),

}


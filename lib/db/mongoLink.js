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
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const mongoLink = mongoose.connection
mongoLink.on('error', err=>{
    console.error("MongoDB error: " + err.message);
})
mongoLink.once('open', () => console.log('MongoDB connection established'))

module.exports = {
    db : mongoose
}

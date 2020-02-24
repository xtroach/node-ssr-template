const mongoose = require('mongoose', { useNewUrlParser: true})
const {credentials} = require('../../config');
const { connectionString } = credentials.mongo;

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
}


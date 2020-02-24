const { Pool } = require('pg')

const { credentials } = require('../../config')

const { connectionString } = credentials.postgres
const pool = new Pool({ connectionString })
async function probeConnection(){
    /*eslint-disable no-unused-vars */
    await pool.query('SELECT $1::text as message', ['Hello world!'],(err,res)=>{
    /*eslint-disable no-unused-vars */
        console.log(err?"Postgres connection failed":"Postgress connection established")
    })
}
probeConnection()
module.exports = {
}
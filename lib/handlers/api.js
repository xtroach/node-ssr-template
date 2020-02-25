const db = require('../db/mongoLink')

exports.getVacation = async (req, res) => {
    const vacations = await db.getVacations({ available: true })
    res.json(vacations)
}

exports.getVacationBySku = async (req, res) => {
    const vacation = await db.getVacations({sku: req.params.sku})
    res.json(vacation)
}

exports.addVacationInSeasonListener = async (req, res) => {

    res.json( await db.addVacationInSeasonListener(req.params.sku, req.body.email))
}

exports.getVacationListeners = async (req,res) => {
    const vacationListeners = await db.getVacationListeners()
    res.json(vacationListeners)
}

exports.requestDeleteVacation = async (req, res) => {
    const db_res = await db.requestDeleteVacationInSeasonListener(req.params.email)
    res.status(200).json(db_res)
}
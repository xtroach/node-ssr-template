const express = require('express')
const api = require('../lib/handlers/api')
const router = express.Router()
const cors = require('cors')

router.use(cors())
router.get('/vacations', api.getVacation)
router.get('/vacation/:sku', api.getVacationBySku)
router.post('/vacation/:sku/notify-when-in-season', api.addVacationInSeasonListener)
router.get('/vacations/listeners',api.getVacationListeners)
router.delete('/vacations/listeners/:email', api.requestDeleteVacation)

module.exports = router
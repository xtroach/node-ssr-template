const express = require('express')
const apiRouter = require('../lib/handlers/api')
const router = express.Router()
const cors = require('cors')

router.use(cors())
router.get('/vacations', apiRouter.getVacation)
router.get('/vacation/:sku', apiRouter.getVacationBySku)
router.post('/vacation/:sku/notify-when-in-season', apiRouter.addVacationInSeasonListener)
router.get('/vacations/listeners',apiRouter.getVacationListeners)
router.delete('/vacations/listeners/:email', apiRouter.requestDeleteVacation)

module.exports = router
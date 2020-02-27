const express = require('express')
const userHandler = require('../lib/handlers/userHandler')
const router = express.Router()



router.use(require('connect-ensure-login').ensureLoggedIn('/login'))

router.get('/logout', function(req, res){
    req.logout();
    res.redirect(req.headers.referer);
});


router.get('/profile/delete/confirm', (req,res)=>res.render('profile-confirm-deletion.handlebars'))
router.post('/profile/delete/confirm', userHandler.deleteProfile)
router.get('/profile/edit', userHandler.editProfile)
router.post('/profile/edit', userHandler.updateProfile)
router.get('/profile', userHandler.getProfile)

/*
    function(req, res){
        res.render('profile',{data: {Name: "Fritz", job:"student", "Birthplace": "Nevada"}})
    });
*/

module.exports = router
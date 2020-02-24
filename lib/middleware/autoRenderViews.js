const autoViews = {}
const fs = require('fs')
const { promisify } = require('util')
const fileExists = promisify(fs.exists)

module.exports = async function(req,res,next) {
    const path = req.path.toLowerCase()
    // check cache; if it's there, render the view
    if (autoViews[path]) return res.render(autoViews[path])
    // if it's not in the cache, see if there's
    // a .handlebars file that matches
    if (await fileExists(__dirname + '/../../views' + path + '.handlebars')) {
        autoViews[path] = path.replace(/^\//, '')
        return res.render(autoViews[path])
    }
    // no view found; pass on to 404 handler
    next()
}

exports.notFound = (req,res) => {
    res.status(404)
    res.render('404')
}
/*eslint-disable no-unused-vars */
exports.serverError = (err,req,res,next) => {
/*eslint-enable no-unused-vars */
    console.error(err)
    res.render('500',{error: err, error_details: err.stack.replace(/\n/,'<br>')})
}
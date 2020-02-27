User = require('mongoose').model('User')


function getProfile(req,res){
    User.findById(req.user._id).lean().exec((err, user)=> {
        const renderOptions = formatUserForView(user,false)
        renderOptions.deleteRef = req.originalUrl + "/delete/confirm"
        renderOptions.editRef = req.originalUrl +"/edit"
        res.render('data-display-test', renderOptions)
    })
}

function deleteProfile(req,res){
    User.findById(req.user._id,(err, user)=> user.remove());
    req.logout()
    res.redirect('/')
}


function formatUserForView(user,  edit = false, pid){


    const id = pid?pid:user._id

    const res = {
        dataset: {
            edit: edit,
            index: user.name,
            data: {
                [user._id]: {
                    label: user.name,
                    entries: {
                        name: {
                            value: user.name,
                            label: "Name",
                        },
                        email: {
                            value: user.email,
                            label: "E-Mail",
                            editable: true,
                        },
                        role: {
                            editable: true,
                            value: user.role,
                            label: "Role"
                        },
                        created: {
                            editable: false,
                            value: user.created.getDate() + '.' + ('0' + user.created.getMonth()).slice(-2) + '.' + user.created.getFullYear(),
                            label: "Created"
                        }
                    }
                }
            }
        }
    }
    for (const property in res.dataset.data[id].entries){
        res.dataset.data[id].entries[property].editable =  res.dataset.data[id].entries[property].editable && edit
    }
    res.dataset.data[id].edit = edit;

    return res
}
function editProfile(req,res){
    User.findById(req.user._id).lean().exec((err, user)=> {
        const renderOptions = formatUserForView(user,true)
        renderOptions.deleteRef = "/delete/confirm"
        renderOptions.editRef = "/profile/edit"
        renderOptions.formMethod = "POST"
        renderOptions.action = "/"
        res.render('data-display-test', renderOptions)
    })
}


function updateProfile(req,res){
    User.findById({_id: req.user.id}).lean().exec((err, user)=> {
        const update = {}
        const data = formatUserForView(user, true).dataset.data[req.user.id].entries
        for (const member in req.body) {
            if (data[member].editable)
                update[member] = req.body[member]
        }
        User.updateOne({_id: req.user.id}, update, (err, user) => {
            console.error(err)
            res.redirect('/user/profile')
        })
    })
}
module.exports = {
    getProfile: getProfile,
    deleteProfile: deleteProfile,
    editProfile: editProfile,
    updateProfile: updateProfile
}
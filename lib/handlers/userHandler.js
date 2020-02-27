User = require('mongoose').model('User')


function getProfile(req,res){
    User.findById(req.user._id).lean().exec((err, user)=>{
        res.render('profile', formatUserForView(user, false))
    })
}

function deleteProfile(req,res){
    User.findById(req.user._id,(err, user)=> user.remove());
    req.logout()
    res.redirect('/')
}


function formatUserForView(user,  edit = false){
    res = {
        edit: edit,
        index: user.name,
        data: {
            name: {
                value: user.name,
                label: "Name",
            },
            email: {
                value: user.email,
                label: "E-Mail",
                editable:true,
            },
            role: {
                editable: true,
                value: user.role,
                label: "Role"
            },
            created: {
                editable: false,
                value: user.created.getDate()+'.'+ ('0'+user.created.getMonth()).slice(-2) +'.'+ user.created.getFullYear(),
                label: "Created"
            }
        }
    }

    for (const property in res.data)
        res.data[property].editable =  res.data[property].editable && edit


    return res
}
function editProfile(req,res){
    User.findById(req.user._id).lean().exec((err, user)=> {

        res.render('profile', formatUserForView(user,true))
    })
}


function updateProfile(req,res){
    User.findById({_id: req.user.id}).lean().exec((err, user)=> {
        const update = {}
        const {data} = formatUserForView(user, true)
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
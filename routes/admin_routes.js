const {Router} = require('express');
const router = Router();
const usersFilter = require('../mongoHelper')
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const Users = require('../models/user');
const Room = require('../models/rooms')
const bcrypt = require('bcryptjs');
let  S3 = require('../s3.js');
const DEFAULT_USER_AVATAR = process.env.DEFAULT_USER_AVATAR;

//create new user form
router.get('/admin/users_create', auth.isAuth, roles.isAdmin, async (req, res) => {
    console.log('started rendering create_profile page');
        res.status(200);
    res.render('./admin/admin_user_create', {
        layout: 'profile',
        title: 'Social Network Inc - Create new profile'})
})

//admin page - list of users
router.get('/admin/users', auth.isAuth, roles.isAdmin, async (req, res) => {
    console.log('Admin mode - user list');
    /* let chat = new Room();
    chat.messages.push('Hi');
    await chat.save();
    console.log(chat); */
    /* console.log(req.session); */
    const users = await usersFilter.adminCut();
    res.status(200);
    res.render('./admin/admin_users', {
        layout: 'profile',
        title: `Social Network Inc Admin mode`,
        users});
});

//edit user page
router.get('/admin/users_edit/:id', auth.isAuth, roles.isAdmin, async (req, res) => {
    console.log(`Admin mode - started edit user ${req.params.id}`);
    let user = await Users.findById({_id: req.params.id});
    res.status(200);
    res.render('./admin/admin_user_edit', {
        layout: 'profile_3lvl',
        title: `Social Network Inc Admin mode edit`,
        user})
})

//edit user request
router.put('/admin/api/users/:id', auth.isAuth, roles.isAdmin, async (req, res) => {
    console.log(`admin API user put request, edited user id:${req.params.id}`);
    try {
        let user = await Users.findById({_id: req.params.id});
        if(!req.body) {return res.sendStatus(400)} 
        else {
            if (user === null) {
                console.log('User did not find - 204');
                /* res.json({url: '/admin/users'}); //url for redirect after succes delete */
                res.redirect('/admin/users'); //url for redirect after succes delete
                res.status(204);
            } else {
                let data = req.body;
                /* console.log(data.id, data.avatar); */
                console.log(`${data.password} must be equal ${user.user_password}`)
                console.log(`user avatar: ${user.user_avatar} request avatar ${data.avatar}`)
                if (data.password == user.user_password) {
                    if (user.user_avatar == null || user.user_avatar == data.avatar || user.user_avatar == '/img/avatar_default.jpg') {
                        console.log('old avatar is null or default avatar (not need to remove from s3)');
                        await Users.findOneAndUpdate({_id: data.id}, {user_name: data.name, user_location: data.location, user_status: data.status, 
                            user_avatar: data.avatar},
                            function(err, user){
                                if(err) return console.log(err);
                                console.log("User has been edited, changed data:", user);
                        });
                    } else {
                        if (user.user_avatar.slice(59).length > 0) {
                            await S3.deleteUserAvatar(user.user_avatar.slice(59));
                            await Users.findOneAndUpdate({_id: data.id}, {user_name: data.name, user_location: data.location, user_status: data.status, 
                            user_avatar: data.avatar},
                            function(err, user){
                                if(err) return console.log(err);
                                console.log("User has been edited, changed data:", user);
                        });
                    }}
                } else {
                    let hashPassword = await bcrypt.hash(data.password, 10);
                    if (user.user_avatar == null || user.user_avatar == data.avatar || user.user_avatar == '/img/avatar_default.jpg') {
                        await Users.findOneAndUpdate({_id: data.id}, {user_name: data.name, user_location: data.location, user_status: data.status, 
                            user_avatar: data.avatar, user_password: hashPassword},
                            function(err, user){
                                if(err) return console.log(err);
                                console.log("User has been edited, changed data:", user);
                        });
                    } else {
                        await S3.deleteUserAvatar(user.user_avatar.slice(59));
                        await Users.findOneAndUpdate({_id: data.id}, {user_name: data.name, user_location: data.location, user_status: data.status, 
                            user_avatar: data.avatar, user_password: hashPassword},
                            function(err, user){
                                if(err) return console.log(err);
                                console.log("User has been edited, changed data:", user);
                        });
                }
                }
                /* res.json({url: `/admin/users_edit/${req.params.id}`}); //url for redirect after succes delete */
                res.render('./admin/admin_user_edit', {
                    layout: 'profile_3lvl',
                    title: `Social Network Inc Admin mode edit`,
                    user})
                console.log('User edited - 200');
                res.status(200);
            };
        };
    } catch(e) {
        console.warn(e);
    }
});

//create user request
router.post('/admin/api/users', auth.isAuth, roles.isAdmin, async (req, res) => {
    console.log(`recieved POST request`);
    try {
        if(!req.body) {return res.sendStatus(400)} 
        else {
            let {name, location, status, avatar, password, id} = req.body;
            let hashPassword = await bcrypt.hash(password, 10)
            /* console.log(id, avatar); */
            await Users.create({user_name: name, user_location: location, user_status: status, 
                user_avatar: avatar, user_password: hashPassword},
                function(err, user){
                    if(err) return console.log(err);
                    res.status(200);
                    res.json({url: `/admin/users`, obj: {user}}); //url for redirect after succes delete   
                    console.log("User created -200:", user);
                } 
            );
        };
    } catch(e) {
        console.warn(e);
    }
});

//delete user request
router.delete('/admin/api/users/:id', auth.isAuth, roles.isAdmin, async (req, res) => {
    console.log(`admin API user delete request: delete user id:${req.params.id}`);
    console.log(`DEFAULT_USER_AVATAR = ${DEFAULT_USER_AVATAR}`)
    try {
        let user = await Users.findById({_id: req.params.id});
        if (user === null) {
            console.log('Allready deleted - 204');
            /* res.json({url: '/admin/users'});  */ //url for redirect after succes delete
            res.redirect(303, `/admin/users`)
            res.status(204);
        } else {
            if (user.user_avatar == DEFAULT_USER_AVATAR) {
                await Users.deleteOne({_id: req.params.id});
                res.json({url: '/admin/users'}); //url for redirect after succes delete
                console.log('User deleted - 200');
                res.status(200);
            } else {
                console.log(`delete from S3: ${user.user_avatar.slice(59)}`);
                await S3.deleteUserAvatar(user.user_avatar.slice(59));
                await Users.deleteOne({_id: req.params.id});
                res.json({url: '/admin/users'}); //url for redirect after succes delete
                console.log('User deleted - 200');
                res.status(200);
            }
        };
    } catch(e) {
        console.warn(e);
    }
});

module.exports = router;
const {Router} = require('express');
const router = Router();
const Users = require('../models/user');
const bcrypt = require('bcryptjs');
const map = require('../wss').map;

router.get('/auth/login', async (req, res) => {
    console.log('started rendering login page...');
    res.render('./auth/login', {
        layout: 'profile',
        title: 'Social Network Inc - Login'/* ,
        csrfToken: req.csrfToken() */})
});

router.get('/auth/login-error', async (req, res) => {
    console.log('started rendering try login page...');
    res.render('./auth/login-error', {
        layout: 'profile',
        title: 'Social Network Inc - Login'})
});

router.get('/auth/logout', async (req, res) => {
    console.log('started rendering login page...');
    const ws = map.get(req.session.user_id);
    /* req.session.isAuthenticated = false; */
    req.session.destroy(() => {
        if (ws) ws.close();
        res.redirect('/auth/login');
    })
});

router.post('/auth/login', async (req, res) => {
    console.log(`recieved login request...${req.body.email}`);
    try {
        console.log(`login: ${req.body.email}, password: ${req.body.password}`)
        let user = await Users.findOne({user_name: req.body.email});
        console.log(`authorized user have roles: ${user.roles}`);
        let areSame = await bcrypt.compare(req.body.password, user.user_password)
        if (areSame) {
                    req.session.isAuthenticated = true;
                    req.session.user_id = user.id;
                    req.session.roles = user.roles;
                    req.session.activeRooms = [];
                    req.session.save(err => {
                        if (err) {
                            throw err
                        }
                    console.log(`User ${user.user_name} was auntificated using password ${req.body.password}`);
                    if (user.roles.includes('ADMIN')) {
                        res.redirect(`/admin/users`);
                    } else {
                        res.redirect(`/`);
                    }                   
                    })
        } else {
            res.redirect('/auth/login-error')
        }
    } catch (e) {
        if (e) {
            console.log('User not found')
            console.log(e)
            res.status(404);
            res.redirect('/auth/login-error');
        }
    }
});

router.get('/auth/registration', async (req, res) => {
    if (req.session.isAuthenticated) {
        console.log('Allready logged in, session will be terminated');
        req.session.destroy();
        const ws = map.get(req.session.user_id);
        if (ws) ws.close();
    }
    console.log('started rendering registration page...');
    res.render('./auth/registration', {
        layout: 'profile',
        title: 'Social Network Inc - Registration'
    });
});

router.post('/auth/registration', async (req, res) => {
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
                    req.session.isAuthenticated = true;
                    req.session.user_id = user.id;
                    req.session.roles = user.roles;
                    req.session.activeRooms = [];
                    req.session.save(err => {
                        if (err) {
                            throw err
                        }
                    res.json({url: `/friend/${user._id}`, obj: {user}}); //url for redirect after succes delete   
                    console.log("User created -200:", user);
                    })
                } 
            );
        };
    } catch(e) {
        console.warn(e);
    }
});

module.exports = router;
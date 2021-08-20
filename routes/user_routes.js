const {Router} = require('express');
const router = Router();
const Users = require('../models/user');
const Room = require('../models/rooms');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const usersFilter = require('../mongoHelper');
let  S3 = require('../s3.js');
let wss = require('../index');
let map = require('../wss').map;

// current user profile and the list of his friends view
router.get('/', auth.isAuth, async (req, res) => {
    console.log('started rendering index page');
    try {
        let currentUser = await Users.find({_id: req.session.user_id});
        currentUser = currentUser[0];
        const currentUserFriends = await usersFilter.friends(currentUser._id, currentUser.follows); //here we query only follows users except admin and current user
        res.status(200);
        res.render('index', {
        title: 'Social Network Inc',
        currentUser,
        quantity_of_friends: currentUserFriends.length,
        currentUserFriends})
    } catch (e) {
        console.log(e);
    }
});

// current user profile and the list of all users
router.get('/all', auth.isAuth, async (req, res) => {
    console.log('started rendering index page');
    try {
        let currentUser = await Users.find({_id: req.session.user_id});
        currentUser = currentUser[0];
        const users = await usersFilter.adminCut(currentUser._id); //here we query all users except admin and current user
        console.log(users.length);
        res.status(200);
        res.render('recommendations', {
        title: 'Social Network Inc',
        currentUser,
        quantity_of_friends: users.length,
        users})
    } catch (e) {
        console.log(e);
    }
});

//other user profile view
router.get('/friend/*', auth.isAuth, async (req, res) => {
    console.log('started rendering profile page');
    let currentUser = await Users.find({_id: req.session.user_id});
    currentUser = currentUser[0];
    const currentUserFriends = await usersFilter.friends(currentUser._id, currentUser.follows); //here we query anly follows users except admin and current user
    const userForRender = await Users.findById({_id: req.params[0]});
    res.status(200);
    res.render('profile', {
        layout: 'profile',
        title: `Social Network Inc ${userForRender.user_name}`,
        quantity_of_friends: currentUserFriends.length,
        currentUserFriends,
        userForRender, currentUser});
});

//follow user
router.put('/friend/*', auth.isAuth, async (req, res) => {
    console.log('started adding profile to follows');
    try {
        let currentUser = await Users.find({_id: req.session.user_id});
        currentUser = currentUser[0];
        console.log(`adding ${currentUser._id} user new follow: ${req.body}`);
    } catch (e) {
        console.log(e);
    };
    try {
        await Users.findOneAndUpdate( 
            {_id: req.session.user_id},
            { $push: { follows:  req.body.id}
        });
        res.status(200);
        res.json({url: `/friend/${req.body.id}`}); //url for redirect after succes delete 
    } catch (e) {
        console.log(e);
    };   
});

//unfollow user
router.delete('/friend/*', auth.isAuth, async (req, res) => {
    console.log('started deleting profile to follows');
    try {
        let currentUser = await Users.find({_id: req.session.user_id});
        currentUser = currentUser[0];
        console.log(`deleting ${currentUser._id} user follow: ${req.body}`);
    } catch (e) {
        console.log(e);
    };
    try {
        await Users.findOneAndUpdate(
            {_id: req.session.user_id},
            { $pull: { follows:  req.body.id} }
        );
    } catch (e) {
        console.log(e);
    };
    res.status(200);
    res.json({url: `/friend/${req.body.id}`}); //url for redirect after succes delete
});

//current user profile edit page
router.get('/edit_profile', auth.isAuth, async (req, res) => {
    console.log('started rendering edit_profile page');
    try {
        let currentUser = await Users.find({_id: req.session.user_id});
        currentUser = currentUser[0];
        res.status(200);
        res.render('edit_profile', {
        title: `Social Network Inc - Edit profile ${currentUser.user_name}`,
        currentUser
        })
    } catch (e) {
        console.log(e);
    }
});

//current user profile edit request
router.put('/edit_profile', auth.isAuth, async (req, res) => {
    console.log(`user edit put request`);
    console.log(req.body);
    let data = req.body;
    try {
        if (req.session.user_id == data.id) 
            {
            let user = await Users.findById({_id: req.session.user_id});
            if (user.user_avatar == null || user.user_avatar == data.avatar) 
                {
                console.log('old avatar is null or default avatar ot same like in request (not need to remove from s3)');
                await Users.findOneAndUpdate({_id: data.id}, {user_location: data.location, user_status: data.status},
                    function(err, user){
                        if(err) return console.log(err);
                        console.log("User has been edited, changed data:", user);
                });
            } else {
                if (user.user_avatar.slice(59).length > 0) {
                    await S3.deleteUserAvatar(user.user_avatar.slice(59));

                    await Users.findOneAndUpdate({_id: data.id}, {user_location: data.location, user_status: data.status, 
                    user_avatar: data.avatar},
                    function(err, user){
                        if(err) return console.log(err);
                        console.log("User has been edited, changed data:", user);});
                } else {
                    await Users.findOneAndUpdate({_id: data.id}, {user_location: data.location, user_status: data.status, 
                    user_avatar: data.avatar},
                    function(err, user){
                        if(err) return console.log(err);
                        console.log("User has been edited, changed data:", user);});
                }
            }
     } else {
            console.log(`trying to edit foreign profile`),
            res.status(403);
            res.json('not permissed');
        }
        
    } catch(e) {
        console.log(e);
    }
    
    /* await Users.findOneAndUpdate({_id: req.session.user_id}, {user_name: data.name, user_location: data.location, user_status: data.status, 
        user_avatar: data.avatar},
        function(err, user){
            if(err) return console.log(err);
            console.log("User has been edited, changed data:", user);
    }); */
});

//wss prototype
router.get('/cht', auth.isAuth, async (req, res) => {
    console.log('started rendering edit_profile page');
    try {
        res.status(200);
        res.render('chatws', {
        title: `Social Network Inc Chat`,
        })
    } catch (e) {
        console.log(e);
    }
});
router.post('/login', auth.isAuth, function (req, res) {
    //
    // "Log in" user and set userId to session.
    //

  
    console.log(`Updating session for user ${req.session.user_id}`);
    req.session.userId = req.session.user_id;
    res.send({ result: 'OK', message: 'Session updated' });
  });

//private chat page
router.get('/messenger/:id', auth.isAuth, async (req, res) => {
    console.log('started rendering private msgs with ' + req.params.id);
    let currentUser = await Users.find({_id: req.session.user_id});
    currentUser = currentUser[0];
    console.log(`current user ${currentUser._id}`);
    const targetUser = await Users.findById({_id: req.params.id});
    console.log(`target: ${targetUser.user_name}`);
    
    //trying to find the room, if they aren't - create the room
    let room = await Room.find({$and: [{usersInRoom:{$in:[req.session.user_id]}},{usersInRoom:{$in:[targetUser._id]}}]}, function (err, rm) {
        /* console.log(`rm: ` + rm);
        console.log(typeof rm); */
    }).catch(e => console.log('something wrong: ' + e));
    
    /* console.log(room); */
    console.log(`porential number of rooms: ` + room.length);

    if (Object.keys(room).length == 0) {
        console.log(`can't find, need to create the room`)

    } else {
        if(Object.keys(room).length > 1) {
            room = room.filter( item => item.usersInRoom.length == 2);
            room = room[0]; 
            console.log(`existing room from array found: ` + room._id);
        } else {
            console.log(`existing room found: ` + room[0]._id);  //+++
        }
    }
    if (Object.keys(room).length == 0) {
        console.log(`room has been created`);
        let newRoom = new Room({
            usersInRoom: [req.session.user_id,targetUser._id], 
        });
        newRoom.save().then(console.log('new room has been created'));
        room = newRoom;
        console.log(`room from newroom =` + room);
    } else if(room[0]) {
        room = room[0];
    }   
    console.log(`mongoRoom ` + room._id);
    for (let msg of room.messages) {
        authorProfile = await Users.findById({_id: msg.author});
        msg.authorAvatar = authorProfile.user_avatar;
        msg.authorName = authorProfile.user_name;
        d = [
            '0' + msg.date.getDate(),
            '0' + (msg.date.getMonth() + 1),
            '' + msg.date.getFullYear(),
            '0' + msg.date.getHours(),
            '0' + msg.date.getMinutes()
            ].map(component => component.slice(-2));
        msg.dates = d.slice(0, 3).join('.') + ' ' + d.slice(3).join(':');
        }
    res.status(200);
    res.render('messenger', {
        title: 'Social Network Inc - Messages',
        layout: 'profile',
        currentUser,
        targetUser,
        room
    })
});

//post new msg in private chat
router.post('/messenger/:roomId', auth.isAuth, async (req, res) => {
    console.log('got msg')
    let {text, roomId, target} = req.body;
    let room = await Room.findById({_id: roomId});
    console.log(`room was found: ` + room._id);
    console.log(`req body: ` + text);
    let msg = {
        author: req.session.user_id,
        date: Date.now(),
        body: text
    }
    /* console.log(`msg is: ` + msg); */
    room.messages.push(msg);
    /* console.log(room); */
    await room.save();
    res.status(200);
    res.json({url: `/messenger/${target}`});
});

//prototype of delete msg API
router.delete('/messenger/delete/:msgId', auth.isAuth, async (req, res) => {
    console.log(`recieve del request`)
    let roomId = req.body.roomId;
    let msgId = req.body.msgId;
    let status = 'error';
    let i = -1
    await Room.findById({_id: roomId}, function (err, doc) {
        for (let e of doc.messages) {
            i++
            if (e._id == msgId) {
                console.log(e._id);
                if (req.session.user_id == e.author) {
                    doc.messages.splice(i, 1);
                    doc.save();
                    status = 'done';
                    res.json({
                        status
                    });
                }
            }
        }
    })
    
    console.log(`${msgId} has been deleted`)
})




//new msg
/* let msg = new Room({
    users: [req.session.user_id,targetUser._id],
    messages: {
        author: req.session.user_id,
        date: Date.now(),
        body: "Test big big flow"
    }
}); */



module.exports = router;
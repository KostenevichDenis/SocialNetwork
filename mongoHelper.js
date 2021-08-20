const Users = require('./models/user');

async function adminCut (id) {
    console.log(`admin cut function started`);
    let users = await Users.find({roles: {$nin :["ADMIN"]}, _id:{$nin: id}});
    /* console.log(`admin found: result ${users}`); */
    return users
}



async function friends (currentUserId, currentUserFriends) {
    console.log(`the function of creating a list of friends is launched`);
    /* console.log(`currentUserId: ${currentUserId}`);
    console.log(`currentUserFriends: ${currentUserFriends}`); */
    let friends = await Users.find({roles: {$nin :["ADMIN"]}, _id:{$ne: currentUserId}, _id:{$in: [...currentUserFriends]}});
    return friends
}

module.exports = {adminCut, friends}
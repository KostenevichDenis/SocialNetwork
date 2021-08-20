function isFriend(targetId, arr) {
    /* console.log(targetId);
    console.log(arr); */
    if ((arr.find(element => element == targetId)) == targetId) {
        console.log ('hbs healper: is friend')
        return true
    } else {
        console.log ('hbs healper: isnt friend')
        return false
    }
}

function sortMsgByDate (arr) {
    arr.sort((a,b) => (a.date < b.date) ? 1 : ((b.date < a.date) ? -1 : 0))
    return arr
}

function isAuthor (authorId, currentUser) {
    /* console.log(`current hbs:` + Object.keys(currentUser)) */
    /* console.log(`current hbs:` + currentUser);
    console.log(`authorId hbs:` + authorId); */
    if (currentUser == authorId) {
        return true
    } else false
}

module.exports = {isFriend, sortMsgByDate, isAuthor}
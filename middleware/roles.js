
function isAdmin (req, res, next) {
    if (!req.session.roles.includes('ADMIN')) {
        console.log(`Non authorized admin connetction try with method: ${req.method}`);
        if (req.method == 'GET') {
            req.session.destroy(() => {
                res.redirect(303,'/auth/login-error');
                })
        } else {
            req.session.destroy(() => {
                console.log('изменил метод')
                res.redirect(303,'/auth/login-error');
            })
        }
        return
    } else {
        next()
    }
}


/* let user = await Users.findById({_id: req.params[0]});
    let x = user.roles.includes('USER') ? true : false;
    console.log(x); */

module.exports = {isAdmin}
function isAuth (req, res, next) {
    if (!req.session.isAuthenticated) {
        console.log('Non authorized connetction try');
        req.session.destroy(() => {
            res.redirect(307, '/auth/login')
            /* res.render('./auth/login', {
                layout: 'profile',
                title: 'Social Network Inc - Login'})*/
            }) 
        return
    } else {
        next()
    }
}

module.exports = {isAuth}
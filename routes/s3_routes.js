const {Router} = require('express');
const router = Router();
const auth = require('../middleware/auth');
let  S3 = require('../s3.js');

//get from AWS S3 trusted URL for upload
router.get('/s3Url', auth.isAuth, async (req, res) => {
    console.log('recieved s3Url request, send request to AWS...')
    const url = await S3.generateUploadURL();
    console.log(url);
    res.send({url});
});

module.exports = router;
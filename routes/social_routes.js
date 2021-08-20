const {Router} = require('express');
const router = Router();
const Users = require('../models/user');
const auth = require('../middleware/auth');
const usersFilter = require('../mongoHelper')
let  S3 = require('../s3.js');


router.get('/messenger.html', auth.isAuth, async (req, res) => {
    console.log('started rendering messenger page');
    res.status(200);
    res.render('messenger', {
        title: 'Social Network Inc - Messages'})
});

//get from AWS S3 trusted URL for upload
router.get('/s3Url', auth.isAuth, async (req, res) => {
    console.log('recieved s3Url request, send request to AWS...')
    const url = await S3.generateUploadURL();
    console.log(url);
    res.send({url});
});

module.exports = router;

/* let users = {
    '0001': {
        id: '0001',
        name: 'Jane Cooper',
        location: 'Santa Ana, Illinois',
        status: 'Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco cillum dolor. Voluptate exercitation incididunt aliquip deserunt reprehenderit elit laborum.',
        avatar: '../img/preview_jane.png'},
    '0002': {
        id: '0002',
        name: 'Theresa Webb',
        location: 'Santa Ana, Illinois',
        status: 'Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco cillum dolor. Voluptate exercitation incididunt aliquip deserunt reprehenderit elit laborum.',
        avatar: '../img/preview_theresa.png'
    },
    '0003': {
        id: '0003',
        name: 'Kathryn Murphy',
        location: 'Santa Ana, Illinois',
        status: 'Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco cillum dolor. Voluptate exercitation incididunt aliquip deserunt reprehenderit elit laborum.',
        avatar: '../img/preview_kathryn.png'
    },
    '0004': {
        id: '0004',
        name: 'Floyd Miles',
        location: 'Santa Ana, Illinois',
        status: 'Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco cillum dolor. Voluptate exercitation incididunt aliquip deserunt reprehenderit elit laborum.',
        avatar: '../img/preview_floyd.png'
    },
    '0005': {
        id: '0005',
        name: 'Annette Black',
        location: 'Santa Ana, Illinois',
        status: 'Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco cillum dolor. Voluptate exercitation incididunt aliquip deserunt reprehenderit elit laborum.',
        avatar: '../img/preview_annette.png'
    },
    '0006': {
        id: '0006',
        name: 'Savannah Nguyen',
        location: 'Santa Ana, Illinois',
        status: 'Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco cillum dolor. Voluptate exercitation incididunt aliquip deserunt reprehenderit elit laborum.',
        avatar: '../img/preview_savannah.png'
    },
    '0007': {
        id: '0007',
        name: 'Cameron Williamson',
        location: 'Santa Ana, Illinois',
        status: 'Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco cillum dolor. Voluptate exercitation incididunt aliquip deserunt reprehenderit elit laborum.',
        avatar: '../img/preview_cameron.png'
    },
    '0008': {
        id: '0008',
        name: 'Brooklyn Simmons',
        location: 'Santa Ana, Illinois',
        status: 'Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco cillum dolor. Voluptate exercitation incididunt aliquip deserunt reprehenderit elit laborum.',
        avatar: '../img/preview_brooklin.png'
    },
    '0009': {
        id: '0009',
        name: 'Albert Flores',
        location: 'Santa Ana, Illinois',
        status: 'Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco cillum dolor. Voluptate exercitation incididunt aliquip deserunt reprehenderit elit laborum.',
        avatar: '../img/preview_albert.png'
    },
}
 */
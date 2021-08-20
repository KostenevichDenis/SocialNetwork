const {Schema, model} = require('mongoose');
const userScheme = new Schema({
    user_name: {
        type: String,
        required: true,
        unique: true
    },
    user_avatar: {
        type: String,
        default: "/img/avatar_default.jpg"
    },
    user_location: {
        type: String,
        required: true
    },
    user_status: {
        type: String,
        required: true
    },
    user_created: {
        type: Date,
        default: Date.now
    },
    user_password: {
        type: String,
        required: true,
        default: ''
    },
    roles: {
        type: Array,
        default: ['USER']
    },
    follows: [String],
    rooms: {
        type: Array
    }
});

module.exports = model('user', userScheme);

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
} */
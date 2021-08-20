const {Schema, model} = require('mongoose');
const roomScheme = new Schema({
    usersInRoom: [String],
    messages: [{
        author: String,
        date: {
            type: Date,
            default: Date.now},
        body: String,
        read: Boolean
        },
        
    ],
    roome_created: {
        type: Date,
        default: Date.now
    }
});

module.exports = model('Room', roomScheme);
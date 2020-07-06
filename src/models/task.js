const mongoose = require('mongoose');
const validator = require ('validator');

const Task = mongoose.model('Task',{
    name: {
        required: true,
        type: String,
        trim: true,
        validate(name) {
            //custom validator if any. Useful for blacklisting 
            console.log(name)
        }
    },
    completed: {
        type: Boolean,
        default:false
    }
})

module.exports = Task



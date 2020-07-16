const mongoose = require('mongoose')
const validator = require ('validator')
const taskSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        trim: true,
        validate(name) {
            //custom validator if any. Useful for blacklisting 
            //console.log(name)
        }
    },
    completed: {
        type: Boolean,
        default:false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},{
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

/**
 * Round about way to delete. Given a name, find id and delete
 * @param {*} name 
 */
const findTaskAndUpdateCompleted = async (name) => {
    task = await Task.findOne( {name:name})
    return await Task.findByIdAndDelete(task._id)
}

module.exports = {Task, findTaskAndUpdateCompleted}



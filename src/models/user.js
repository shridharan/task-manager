const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt  = require('jsonwebtoken')
const {appSecret} = require('../config/config')
const {Task} = require('../models/task')

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        requried: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Invalid Email!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        validate(value) {
            //check for blacklisted words
            if (value.toLowerCase().includes('password')) {
                throw new Error('Not a valid password!')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},{
    timestamps: true
})

userSchema.virtual('tasks', {
    ref:'Task',
    localField:'_id',
    foreignField: 'owner'
})

//converting object to json with overrides
userSchema.methods.toJSON = function() {
    const user = this.toObject()
    delete user.password
    delete user.tokens
    return user
}

//for controlling access, we need JWTs
userSchema.methods.generateAuthToken = async function () {
    const user = this
    //this should eventually come from configs and not hard coded
    const token = jwt.sign({_id:this._id.toString()},appSecret)
    this.tokens =  this.tokens.concat({token})
    await this.save()
    return token
}

//User for logging in 
userSchema.statics.findByCredentials = async function (email, password) {
    const user = await User.findOne({email})
    if (!user) {
        throw new Error ('Unable to find user')
    }
    //compared user entered password with already hashed password
    isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
        throw new Error ('Unable to login!')
    }
    //return entire user object for now. will remove password later
    return user
}

//On save we need to calculate bcrypt hash for user's password if changed
userSchema.pre('save', async function (next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }
    // pass control on to next in line 
    next()
})


//Delete all tasks user owns when all tasks are removed
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
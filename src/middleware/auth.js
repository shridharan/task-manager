const jwt = require('jsonwebtoken')
const {appSecret} = require('../config/config')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decodedJwt = jwt.verify(token, appSecret)
        req.user = await User.findOne({_id:decodedJwt._id,'tokens.token': token})
        if (!req.user) {
            throw new Error('Unable to find user!')
        }
        req.token = token
        next()
    } catch(e) {
        res.status(401).send({error:'Unauthorized: Please authenticate!'})
    }
}

module.exports = auth
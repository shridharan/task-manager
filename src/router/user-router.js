const express = require('express')
const userRouter = express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
//Create new user
userRouter.post('/users/signup', async (req, res) => {
    try {
        const user = await new User(req.body).save()
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch (e) {
        res.status(400).send(e)
    }
})

//User login
userRouter.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        if(!user) {
            return res.status(404).send({error:'User not found!'})
        }
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

userRouter.post('/users/logout', auth,  async (req, res)=> {
    try {
        req.user.tokens = req.user.tokens.filter((token)=> {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send(e)
    }
})

//force logout from all devices/tokens
userRouter.post('/users/logoutAll', auth,  async (req, res)=> {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send(e)
    }
})

userRouter.get('/users/me',auth, async (req, res)=>{
    try {
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})


userRouter.patch('/users/me', auth, async (req, res) => {
    const allowedUpdates = ['name', 'password', 'email']
    const updates = Object.keys(req.body)
    const isValidOp = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOp) {
        return res.status(400).send({error:'Not a valid operation!'})
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        res.send(await req.user.save())
    } catch (e) {
        res.status(400).send(e)
    }
})


userRouter.delete('/users/me', auth, async (req, res) => {
    try {
        res.send(await req.user.remove())
    } catch (e) {
        res.status(404).send(e)
    }
})


module.exports = userRouter
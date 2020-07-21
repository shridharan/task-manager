const express = require('express')
const userRouter = express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const sharp = require('sharp')

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

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb) {

        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Not a valid image! Supported types are jpg,jpeg and png'))
        }
        cb(undefined, Date.now()+path.extname(file.originalname))
        //cb(undefined, true)
    }
})

userRouter.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    console.log(error)
    //function to catch unhandled errors
    res.status(400).send({error: error.message})
 })

 userRouter.delete('/users/me/avatar',auth, async (req,res)=> {
     try{
        if(!req.user.avatar) 
            return res.status(404).send({error:'Avatar not found!'})
        req.user.avatar = undefined
        await req.user.save()
        res.send()
     } catch (e) {
         res.status(500).send(e.message)
     }
 })

userRouter.get('/users/:id/avatar', async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) {
            throw new Error ('User or avatar not found!')
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send({error:e.message})
    }
})
module.exports = userRouter
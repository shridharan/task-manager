
const express = require('express')
const taskRouter = express.Router()
const auth = require('../middleware/auth')
const {Task,findTaskAndUpdateCompleted} = require('../models/task')

//only get the tasks for which user is the owner
taskRouter.get('/tasks', auth, async (req, res) => {
    try {
        await req.user.populate('tasks').execPopulate()
        res.send(req.user.tasks)
        //res.send(await Task.find({owner:req.user._id}))
    }catch(e) {
        res.status(500).send(e)
    }
})

taskRouter.get('/tasks/:id', auth, async (req, res) => {
    try{
        res.send(await Task.find({_id:req.params.id, owner:req.user._id}))
    }catch(e) {
        res.status(500).send(e)
    }
})

taskRouter.post('/tasks', auth, async (req, res)=> {
    try{
        const owner = req.user._id
        res.status(201).send(await new Task({...req.body,owner}).save())
    }catch(e){
        res.status(400).send(e)
    }
})

taskRouter.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        if (!task) {
            throw new Error()
        }
        res.send(task.remove())
    }catch(e) {
        res.status(404).send({error:'Task not found!'})
    }
})

taskRouter.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','completed']
    
    const isAllowedUpdate = updates.every((update)=> allowedUpdates.includes(update))
    if(!isAllowedUpdate) {
        return res.status(400).send({error:'Not a valid update!'})
    }
    try {
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        if (!task) {
            return res.status(404).send({error:'Task not found!'})
        }
        updates.forEach((update)=> task[update] = req.body[update])
        res.send(await task.save())
    }catch(e) {
        res.status(500).send(e)
    }
})

module.exports = taskRouter
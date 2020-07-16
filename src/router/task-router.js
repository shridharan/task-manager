
const express = require('express')
const taskRouter = express.Router()
const auth = require('../middleware/auth')
const {Task,findTaskAndUpdateCompleted} = require('../models/task')

//only get the tasks for which user is the owner
// Get tasks?completed=true
// Get tasks?limit=1&skip=1
// Get tasks?sortBy=createdAt:desc
taskRouter.get('/tasks', auth, async (req, res) => {
    const match = {}
    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    let limit = 10
    if(req.query.limit) {
        limit = parseInt(req.query.limit)
    }

    let skip = 0
    if(req.query.skip) {
        skip = parseInt(req.query.skip)
    }

    const sortBy = {}
    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sortBy[parts[0]] =  parts[1] === 'asc' ? 1 : -1
    }

    try {
        await req.user.populate({
            path:'tasks',
            match,
            options: { 
                limit: limit,
                skip: skip,
                sort: sortBy
            }
        }).execPopulate()
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
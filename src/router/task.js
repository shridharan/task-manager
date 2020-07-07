
const express = require('express')
const taskRouter = express.Router()
const {Task,findTaskAndUpdateCompleted} = require('../models/task')

taskRouter.get('/tasks', async (req, res) => {
    try {
        res.send(await Task.find({}))
    }catch(e) {
        res.status(500).send(e)
    }
})

taskRouter.get('/tasks/:name', async (req, res) => {
    try{
        res.send(await Task.find({name:req.params.name}))
    }catch(e) {
        res.status(500).send(e)
    }
})

taskRouter.post('/tasks', async (req, res)=> {
    try{
        res.status(201).send(await new Task(req.body).save())
    }catch(e){
        res.status(400).send(e)
    }
})

taskRouter.delete('/tasks/:name', async (req, res) => {
    try {
        res.send(await findTaskAndUpdateCompleted(req.params.name))
    }catch(e) {
        res.status(404).send(e)
    }
})

taskRouter.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','completed']
    
    const isAllowedUpdate = updates.every((update)=> allowedUpdates.includes(update))
    if(!isAllowedUpdate) {
        return res.status(400).send({error:'Not a valid update!'})
    }
    try {
        res.send(await Task.findByIdAndUpdate(req.params.id,req.body, {new:true}))
    }catch(e) {
        res.status(500).send(e)
    }
})

module.exports = taskRouter
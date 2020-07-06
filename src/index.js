const express = require('express')
const {Task,findTaskAndUpdateCompleted} = require('./models/task')
const mongoose = require('./db/mangoose')

const app = express()
const port = process.env.PORT || 3000

//consvert body to json from application/json
app.use(express.json())

app.get('/tasks', async (req, res) => {
    try {
        res.send(await Task.find({}))
    }catch(e) {
        res.status(500).send(e)
    }
})

app.get('/tasks/:name', async (req, res) => {
    try{
        res.send(await Task.find({name:req.params.name}))
    }catch(e) {
        res.status(500).send(e)
    }
})

app.post('/tasks', async (req, res)=> {
    try{
        res.status(201).send(await new Task(req.body).save())
    }catch(e){
        res.status(400).send(e)
    }
})

app.delete('/tasks/:name', async (req, res) => {
    try {
        res.send(await findTaskAndUpdateCompleted(req.params.name))
    }catch(e) {
        res.status(404).send(e)
    }
})

app.patch('/tasks/:id', async (req, res) => {
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

app.listen(port, ()=> {
    console.log('Task service listening on',port)
})
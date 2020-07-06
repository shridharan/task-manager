const express = require('express')
const Task = require('./models/task')
const mongoose = require('./db/mangoose')

const app = express()
const port = process.env.port || 3000

//consvert body to json from application/json
app.use(express.json())

app.get('/tasks', (req, res) => {
    // const task = new Task(req.body)
    // task.save().then((task)=>{
    //     res.status(201).send($task)
    // })
    // .catch((error)=>{
    //     res.status(400).send(error)
    // }) 
})

app.post('/tasks', (req, res)=> {
    console.log(req.body)
    const task = new Task(req.body)
    task.save().then((task)=>{
        res.status(201).send(task)
    })
    .catch((error)=>{
        res.status(400).send(error)
    }) 
})

app.listen(port, ()=> {
    console.log('Task service listening on',port)
})
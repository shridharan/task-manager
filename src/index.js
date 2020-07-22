const express = require('express')
const mongoose = require('./db/mangoose')
const taskRouter = require('./router/task-router')
const userRouter = require('./router/user-router')

const app = express()
//convert body to json from application/json
app.use(express.json())
app.use(taskRouter)
app.use(userRouter)

const port = process.env.PORT
app.listen(port, ()=> {
    console.log('Task service listening on',port)
})
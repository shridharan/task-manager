const express = require('express')
const mongoose = require('./db/mangoose')
const taskRouter = require('./router/task')

const app = express()
//convert body to json from application/json
app.use(express.json())
app.use(taskRouter)

const port = process.env.PORT || 3000
app.listen(port, ()=> {
    console.log('Task service listening on',port)
})
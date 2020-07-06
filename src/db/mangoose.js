const mongoose = require('mongoose');

const mongoDBUrl = 'mongodb://127.0.0.1:27017/tasks'

mongoose.connect(mongoDBUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
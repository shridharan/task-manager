const mongoose = require('mongoose');
const {mongoDBUrl} = require('../config/config')

mongoose.connect(mongoDBUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
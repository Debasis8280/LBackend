const mongoose = require('mongoose');

const course = mongoose.Schema({
    collectionName:String,
    courseName:String,
    coursePhoto:String,
    title:String,
    subtitle:String,
    photo:String,
    body:String,
   
})

module.exports = course
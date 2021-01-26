const mongoose = require('mongoose');

const Admin = mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    googleId:{
        type:String,
        require:true
    },
    imageUrl:{
        type:String,
        require:true
    }

})

module.exports = mongoose.model("Admin",Admin);
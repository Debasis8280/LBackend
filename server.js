const express = require('express');
const cors = require("cors");
const app = express();
const mongoose = require('mongoose');
require("./model/admin");
const admin = require("./routers/admin");
const course = require("./routers/courses");
const path = require("path")
const client = require("./routers/client");

mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb+srv://Debasis:Debasis@learn.baamj.mongodb.net/learn?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true}).then(()=>{
     console.log("Connected");
}).catch(err=>console.log(err.message))


app.use(cors());
app.use(express.static(__dirname + '/image'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/admin",admin);
app.use("/course",course);
app.use("/client",client)
app.get("/",(req,res)=>{
    res.send("De");
})

const port = process.env.PORT || "8080";
app.listen(port, () => {
    console.log(`Server started on 8080`);
});
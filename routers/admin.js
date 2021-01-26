const express = require('express');
const jwt = require("jsonwebtoken");
const router = require('express').Router();
const mongoose = require('mongoose');
const Admin = mongoose.model("Admin");
const auth = require("../middleware/auth");
const jwtSecret = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

//google login
router.post("/login",async (req, res)=>{
    try{
        const {email ,googleId} = req.body;
        const admin = await Admin.findOne({email,googleId});
        if(admin){
            res.json({
                token:jwt.sign({id:admin.id},jwtSecret),
                message:"Login Successfully",
                auth:true,
                result:"Ok"
            })
        }
        else{
            res.json({
                message:"Login failed",
                result:"Failed",
                title:"You Try To Login With Different Email "
            })
        }
    }catch(err){
        res.send(err.message)
    }
    
})


//get admin
router.get("/getAdmin",auth,async (req, res) =>{
    const admin = await Admin.findOne({_id:req.id});
   if(admin){
       res.json({admin:admin,result:"Ok"});
   }
})
module.exports = router;
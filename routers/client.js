const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const course = require("../model/courses");
const auth = require("../middleware/auth")
//get all course title
router.get("/title", async (req, res) => {
    try {
        let collectionName = [];
        const collectioList = await mongoose.connection.db.listCollections().toArray();
        const data = collectioList.map(async (collection) => {
            collectionName.push(collection.name);
            const model = mongoose.model(collection.name, course);
            const data = model.findOne();
            return data;
        })
        const result = await Promise.all(data);
        result.splice(0, 1);
        collectionName.splice(0, 1)
        res.json({
            data: result,
            result: "Ok",
            collection: collectionName
        });
    } catch (error) {
        console.log(error);
    }
})

//get Course data by Collection name

router.get("/courseData", async (req, res) => {

    const model = await mongoose.model(req.query.collection, course);
    const data = await model.find()
    if (data.length > 0) {
        data.splice(0, 1);
        res.json({
            data: data,
            result: "Ok",
            image: `http://localhost:8080/${req.query.collection}`
        });
    } else {
        res.json({
            result: "Failed"
        });
    }


})

//get data using title

router.get("/getDataUsingTitle",async(req, res) => {
    const model =await mongoose.model(req.query.collection,course);
    const data = await model.findOne({_id:req.query.id})
    if(data){
         res.json({
             data:data,
             result:"Ok",
             image:`http://localhost:8080/${req.query.collection}`
         });
    }
    else{
         res.json({
             result:"Faild"
         });
    }
})

module.exports = router;
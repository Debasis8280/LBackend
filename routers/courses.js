const auth = require("../middleware/auth");
const router = require("express").Router();
const mongoose = require("mongoose");
const course = require("../model/courses");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exists, findOne } = require("../model/admin");
var rimraf = require("rimraf");

//course icon storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "image/icon");
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      req.body.courseName + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// image validation
const imageFilter = function (req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = "Only image files are allowed!";
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

//create collection
router.post("/createCollection", auth, async (req, res) => {
  let upload = multer({ storage: storage, fileFilter: imageFilter }).single(
    "image"
  );
  upload(req, res, async function (err) {
    // req.file contains information of uploaded file
    // req.body contains information of text fields, if there were any

    if (req.fileValidationError) {
      return res.json({
        message: req.fileValidationError,
      });
    } else if (!req.file) {
      return res.json({ message: "Please select an image to upload" });
    } else if (err instanceof multer.MulterError) {
      return res.json({ message: err });
    } else if (err) {
      return res.json({ message: err });
    }
    if (req.body.collections === "" || req.body.courseName === "") {
      res.json({
        message: "You Need To Fill All Field",
      });
    }
    const already = await mongoose.connection.db
      .listCollections({ name: req.body.collections })
      .next(async (err, coll) => {
        if (coll) {
          res.json({
            message: "Collection Already Exit",
            result: "Failed",
          });
        } else {
          const collection = await mongoose.model(req.body.collections, course);
          collection.createCollection();

          const coursePresent = await collection.findOne({
            courseName: req.body.courseName,
          });
          if (coursePresent) {
            return res.json({ message: "Course Name Already Present" });
          }
          collection
            .create({
              courseName: req.body.courseName,
              coursePhoto: req.file.filename,
              collectionName:req.body.collections
            })
            .then(() => {
              res.json({
                message: "Collection Created Successfully",
                result: "Ok",
              });
            });
        }
      });
  });
});

//get collection-list
router.get("/collection-list", auth, async (req, res) => {
  try {
    const collectioList = await mongoose.connection.db.listCollections().toArray();
    const data = collectioList.map(async (collection) => {
      const model =   mongoose.model(collection.name, course);
      const data =   model.findOne();
      return data;
    }); 
    const result = await Promise.all(data);
    result.splice(0, 1);
    res.json({
      data: result,
      result: "Ok",
    });
  } catch (error) {
    console.log(error);
  }
});

// delete Collection

router.get("/deleteCollection", auth, async (req, res) => {
  const model = mongoose.model(req.query.collection, course)
  const data = await model.findOne().limit(1)
  rimraf.sync("image/icon/" + data.coursePhoto)
  mongoose.connection.db.dropCollection(req.query.collection, (err, data) => {
    if (!err) {
      rimraf.sync("image/" + req.query.collection)
      res.json({
        message: `${req.query.collection} Collection Delete Successfully`,
        result: "Ok",
      });
    } else {
      res.send("Collection Does Not Exit");
    }
  });
});

//store course image
const storageCourseImage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = `image/${req.body.collectionCourse}`;
    fs.exists(dir, (exist) => {
      if (!exist) {
        return fs.mkdir(dir, (error) => cb(error, dir));
      }
      return cb(null, dir);
    });
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      req.body.title + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// image validation
const CourseImageFilter = function (req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = "Only image files are allowed!";
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

//save data
router.post("/save", auth, async (req, res) => {
  let upload = multer({
    storage: storageCourseImage,
    fileFilter: CourseImageFilter,
  }).single("image");
  upload(req, res, async function (err) {
    //console.log(req.file.filename+"aasdsd")
    if (req.fileValidationError) {
      return res.json({
        message: req.fileValidationError,
      });
    } else if (!req.file) {
      // return res.json({ message: "Please select an image to upload" });
      const model = mongoose.model(req.body.collectionCourse, course);
      const { title, subtitle, body } = req.body;
      if (title === "" || body === "") {
        res.json({
          message: "You Need To Fill All The Field",
        });
      }
      model
        .create({
          title: title,
          subtitle: subtitle,
          body: body,
        })
        .then(() => {
          res.json({
            message: "Save SuccessFully",
            result: "Ok",
          });
        })
        .catch((err) => {
          res.json({ message: err.message });
        });
    } else if(req.file){
      const model = mongoose.model(req.body.collectionCourse, course);
    const { title, subtitle, body } = req.body;
    if (title === "" || body === "") {
      res.json({
        message: "You Need To Fill All The Field",
      });
    }
    model
      .create({
        title: title,
        subtitle: subtitle,
        photo: req.file.filename,
        body: body,
      })
      .then(() => {
        res.json({
          message: "Save SuccessFully",
          result: "Ok",
        });
      })
      .catch((err) => {
        res.json({ message: err.message });
      });
    }
    
    else if (err instanceof multer.MulterError) {
      return res.json({ message: err });
    } else if (err) {
      return res.json({ message: err });
    }
   });
});

//get course Data
router.get("/getCourseData", auth, (req, res) => {
  const model = mongoose.model(req.query.collection, course);
  model
    .find()
    .then((data) => {
      if (data) {
        res.json({
          data: data,
          result: "Ok",
          image: `https://learn-backend.zeet.app/${req.query.collection}/`,
        });
      }
    })
    .catch((err) => {
      res.json({
        message: err.message,
      });
    });
});

//search
router.get("/search", auth, async (req, res) => {
  //  console.log(req)
  const model = mongoose.model(req.query.collection, course);
  const data = await model.find({ title: req.query.search });
  if (data.length > 0) {
    res.json({
      result: "Ok",
      data: data,
      image: `https://learn-backend.zeet.app/${req.query.collection}/`,
    });
  } else {
    res.json({
      message: "No Data Found...",
    });
  }
});

//get data by id
router.get("/getSelectedData", auth, async (req, res) => {
  try {
    const model = mongoose.model(req.query.collection, course);
    const data = await model.findOne({ _id: req.query.id });
    //console.log("debasis")
    if (data) {
      res.json({
        data: data,
        result: "Ok",
        image: `https://learn-backend.zeet.app/${req.query.collection}/`,
      });
    } else {
      res.json({
        message: "No Data Found",
      });
    }
  } catch (err) {
    res.json({
      message: "No Data Found",
      error: err.message,
    });
  }
});


//update course

const updateCourseImage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = `image/${req.body.collection}`;
    fs.exists(dir, (exist) => {
      if (!exist) {
        return fs.mkdir(dir, (error) => cb(error, dir));
      }
      return cb(null, dir);
    });
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      req.body.title + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// update Course
router.put("/updateCourse", auth, async (req, res) => {
  let upload = multer({
    storage: updateCourseImage,
    fileFilter: CourseImageFilter,
  }).single("image");
  upload(req, res, async function (err) {
    const { title, subtitle, body, collection, id } = req.body
    const model = mongoose.model(collection, course);
    const data = await model.findOne({ _id: id });
    if (req.file) {
      rimraf.sync(`image/${collection}/${data.photo}`)
      model.findOneAndUpdate({ _id: id }, { title: title, subtitle: subtitle, photo: req.file.filename, body: body }).then(() => {
        res.json({
          message: "Data Update SuccessFully",
          result: "Ok"
        });
      }).catch((err) => {
        res.send(err.message)
      })
    }
    else {
      model.findOneAndUpdate({ _id: id }, { title: title, subtitle: subtitle, body: body }).then(() => {
        res.json({
          message: "Data Update SuccessFully",
          result: "Ok"
        });
      }).catch((err) => {
        res.send(err.message)
      })
    }
  })
})


//delete course by id
router.delete('/delete', auth, (req, res) => {
  const { collection, id } = req.body;
  const model = mongoose.model(collection, course);
  model.findOne({ _id: id }).then((data) => {
    if (data) {
      rimraf.sync(`image/${collection}/${data.photo}`)
      model.findByIdAndRemove({ _id: id }).then(() => {
        res.json({
          message: "Delete SuccessFully",
          result: "Ok"
        });
      }).catch((err) => {
        res.send(err.message);
      })

    }
  }).catch(err => {
    res.send(err.message);
  })
});
module.exports = router; 

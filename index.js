const express = require('express')
const app = express()
const cors = require('cors')
// body-parser lib to help parse form bodies
const bodyParser = require('body-parser')
// mongoose is an ORM that works with mongoDB
const mongoose = require('mongoose');
// use dotenv to read the .env variables
require("dotenv").config();

//the MONGO_URI is coming from the cluster on AtlasDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Basic Configuration
//const port = process.env.PORT || 3000;
const { Schema } = mongoose;

app.use(cors())
app.use(express.static('public'))

// setup body-parser middleware to parse the post request body
app.use(bodyParser.urlencoded({extended: false}));

// the user schema 
let userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  loggedExercises: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
});

// the exercise schema
const exerciseSchema = Schema({
  userid: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: Date
});

// the User model
let UserRecord = mongoose.model("User", userSchema);
// the Exercise model
let ExerciseRecord = mongoose.model("Exercise", exerciseSchema);

const listener = app.listen(process.env.PORT || 3000, (error) => {
  // This is important!
  // Without this, any startup errors will silently fail
  // instead of giving you a helpful error message.
  if (error) {
    throw error;
  }
  console.log("Your app is listening on port " + listener.address().port);
})


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});


const findOneByUsername = async (username) => {
  const queryResult = await UserRecord.findOne({ username });
  if (queryResult) {
    console.log(queryResult);
    return queryResult._id;
  } else {
    return null;
  }
};

// use route chaining to handle get and post
app.route("/api/users").get(async (req, res) => {
  const allUsers = await UserRecord.find();
  console.log(allUsers);
  res.json(allUsers);
}).post(async (req, res) => {
  const username = req.body.username;
  const validUserRegex = /^[a-zA-Z0-9_]{5,}$/;
  
  if (validUserRegex.test(username)) {
    console.log("it's valid, save it");
    //then after saving, get the result res.json: {"username":"pink","_id":"68af1302509d2d00133008f1"}
    
    //step 1: figure out if the person already exists in the db
    let userid = await findOneByUsername(username);
    console.log(userid);
    if (userid) {
      console.log("this user exists");
    } else {
      console.log("this is a new user");
      // to create new document, we instantiate the model (URLRecord)
      let userRecord = new UserRecord({ username });
      
      // then we can save the new instance of UserRecord to the users collection
      const doc = await userRecord.save();
      console.log(doc);
      userid = doc._id;
    }
    res.json({ "username": username, "_id": userid });
  } else {
    console.log(`username ${username} is invalid, ignore it`);
  }
});

// use route chaining to handle get and post
app
  .route("/api/users/:userid/exercises")
  .get(async (req, res) => {
    /*
    const allExercises = await ExerciseRecord.find();
    console.log(allExercises);
    res.json(allExercises);
    */
  })
  .post(async (req, res) => {
    // get form data(description is required, duration is required, but date is not)
    const userid = req.body[":_id"];

    const usernameDoc = await UserRecord.findById(userid, {
      username: 1,
    });
    const username = usernameDoc?.username;

    if (usernameDoc) {
      const description = req.body.description;
      // duration is in minutes
      const duration = req.body.duration;
      const today = new Date();
      // if date not given, then use today's date
      let date = req.body.date;
      if (date === "") {
        console.log("try to make a new date");
        date = `${today.getFullYear()}-${
          today.getMonth() + 1
        }-${today.getUTCDate()}`;
      }

      // create the exercise record (let it fail automatically if the userid doesn't exist)
      // to create new document, we instantiate the model (ExerciseRecord)
      let exerciseRecord = new ExerciseRecord({
        userid,
        description,
        duration,
        date,
      });

      // then we can save the new instance of UserRecord to the users collection
      const doc = await exerciseRecord.save();
      console.log("output of save: ", doc);
      const recordDate = new Date(doc.date);
      const options = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      const outputDate = `${recordDate.toLocaleDateString(
        undefined,
        options
      )}`.replace(/,/g, "");

      res.json({
        _id: doc.userid,
        username: username,
        date: outputDate,
        duration: doc.duration,
        description: doc.description,
      });
    }
  });

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
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// the user schema 
let userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  loggedExercises: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
});

// the exercise schema
const exerciseSchema = Schema({
  userid: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: Date
});

let User = mongoose.model("User", userSchema);
let Exercise = mongoose.model("Exercise", exerciseSchema);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

// setup body-parser middleware to parse the post request body
app.use("/api/users", bodyParser.urlencoded());

// Create new user
app.post("/api/users", async (req, res) => {

  /**
  const pageURL = req.body.url; // Assuming imageUrl is sent in the request body
  console.log("pageURL", pageURL);
  const valid = await isValidUrl(pageURL)
  console.log("result of isValidUrl:", valid);
  if (valid) {
    // URL is valid, proceed with processing
    const shorturl = await createAndSaveURLRecord(pageURL)
    console.log("shorturl -> ", shorturl);
    res.json({ original_url: pageURL, short_url: shorturl });

  } else {
    // URL is invalid
    res.json({ error: "invalid url" });
  }
  */
  
  console.log(req.body);
});
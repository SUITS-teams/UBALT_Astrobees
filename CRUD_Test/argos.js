var express = require("express");
var app = express();
var port = 3000;
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//To retrieve entries from the database
app.get("/", (req, res) => {
      var http = require('http');
      var url = require('url');
      var MongoClient = require('mongodb').MongoClient;
      //connect to mongodb Atlas
      //the uri below can be interpreted as:
      //(mongodb+srv tells it to go to Mongodb atlas not a local mongo server)
      //uri = "mongo_in_the_cloud://userrname:password@mongo_cluster_name.mongodb.net/extra_parameters_added_by_mongo_when_the_connection_string_was_generated"
      var uri = "mongodb+srv://eubie:Astr0B33%24@asrtobees-test-cluster-6lrkk.mongodb.net/test?retryWrites=true&w=majority";


      MongoClient.connect(uri, { useNewUrlParser: true }, function(err, db) {
    	  if (err) throw err;
    	  var dbo = db.db("node-demo");
        //display all entries in the database
    	  dbo.collection("users").find().toArray(function(err, result) {
    	    if (err) throw err;
    	    res.writeHead(200, {'Content-Type': 'text/html'});
    	    res.end(JSON.stringify(result));
    	    db.close();
    	  });
    	});
});


var mongoose = require("mongoose");
//mongodb node-demo database in the cloud
var uri = "mongodb+srv://eubie:Astr0B33%24@asrtobees-test-cluster-6lrkk.mongodb.net/node-demo?retryWrites=true&w=majority";
mongoose.Promise = global.Promise;
mongoose.connect(uri, { useNewUrlParser: true });
//This creates the schema for the database
var nameSchema = new mongoose.Schema({
  //Schema for Message_Manager
    sender: String,
    receiver: String,
    message: String,
  //Schema for Telemetry_Stream
    Time: String,
    CO2Level: Number,
    oxygenLevel: Number,
    Data: String,
    hasIcon: Number,
    Title: String,
    hasSlider: Number,
    value: String,
    Tier: Number,
    subTier: Number,
    sub_sub_tier: Number,
  //Schema for Field_Notes
    note_title: String,
    notes: String

}, { timestamps: true });
var User = mongoose.model("User", nameSchema);

//Load the message manager webpage
app.get("/send", (req, res) => {
  res.sendFile(__dirname + "/Message_Manager.html")
});


//To write data to the database from the browser
//Gotten from https://codeburst.io/hitchhikers-guide-to-back-end-development-with-examples-3f97c70e0073
app.get("/insert", (req, res) => {
    var myData = new User(req.query);
    //TODO ADD STORAGE TIMESTAMP TO myData
    myData.save()
        .then(item => {
            res.send("Message saved to database");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});


  //retrieve receipient-specific data from the database by specifying the receipient in the browser query.
  app.get("/retrieve", (req, res) => {
    var http = require('http');
    var url = require('url');
    var MongoClient = require('mongodb').MongoClient;
    //connect to mongodb Atlas
   var uri = "mongodb+srv://eubie:Astr0B33%24@asrtobees-test-cluster-6lrkk.mongodb.net/test?retryWrites=true&w=majority";


    MongoClient.connect(uri, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("node-demo");
      //display all entries in the database with the keyword provided in the query
      let myparam = req.query.receiver;
      dbo.collection("users").find({receiver:myparam}).toArray(function(err, result) {
        if (err) throw err;
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(JSON.stringify(result));
        db.close();
      });
    });

});

//launch the telemetry data entry webpage
app.get("/telemetry", (req, res) => {
  res.sendFile(__dirname + "/Telemetry_Stream.html")
});

//launch the field notes entry webpage
app.get("/notes", (req, res) => {
  res.sendFile(__dirname + "/Field_Notes.html")
});


//reach out to an external source to pull images
//To illustrate the concept,this currently redirects to a free stock image. Ideally, it would lead to the file server housing the needed images.
app.get("/images", (req, res) => {
  res.writeHead(301,{Location: 'https://www.pexels.com/photo/people-silhouette-during-sunset-853168/'});
//  res.sendFile(Location: "https://www.pexels.com/photo/people-silhouette-during-sunset-853168/")
res.end();
});

app.listen(port, () => {
    console.log("Server listening on port " + port);
});

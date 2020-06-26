var Telemetry = require('./telemetry.js');
var globalVariables = require('./globalVariables.js');
var util = require('util');
const io = require('socket.io')(3000);
console.log('started server');
// Connect to mongodb 
var mongoClient = require('mongodb').MongoClient;
// urr = mongodb + server :username:password@mongo_in_the _cloud_cluster
var url = "mongodb+srv://mvandi:LfxT2oDeXCaYr9ZO@asrtobees-test-cluster-6lrkk.mongodb.net/test?retryWrites=true&w=majority";
var mongoTelemetry;
mongoClient.connect(url, function(err, db) {
    if (err) throw err;
    if (err) {
        console.log("Error");
    } else {
        console.log("Mongo Db log in successful");
    }
    var dbo = db.db("node-demo");

    dbo.collection("users").find().toArray(function(err, result) {
        if (err) throw err;
        // mongoTelemetry = result;

        console.log("\nTelemetry from new mongo : " + JSON.stringify(result));
    })
});
//console.log("Telemetry from mongo: " + JSON.stringify(mongoTelemetry));


// Get Telemetry from Database. I am using a sample file here but this is what it will look like
// var newTelemetry = new Telemetry(mongoTelemetry);
var telemetry = new Telemetry(globalVariables.telemetry);
// Time to wait before sending new telemetry data to magic leap 1
// let sleep = ms => new Promise (resolve => setTimeout(resolve, ms));

console.log(JSON.stringify(telemetry.getTelemetrySnapShot()));

setInterval(() => {
    // Next we call a function to set random values for the telemetry
    telemetry.setTelemetrySnapshot(telemetry.getTelemetrySnapShot());
    console.log(JSON.stringify(telemetry.getTelemetrySnapShot()));
    console.log('\n \n');
}, 5000);

// console.log('\n passed interval code');

io.on('connection', socket => {
    socket.emit('initTelemetry', telemetry.getTelemetrySnapShot());
    socket.emit('con', 'new user 1');
    console.log('device connected to server');
    // Start up a timer that periodically sends telemetry data to magic leap 1
    socket.on('initialTelemetryReceived', function updateTelemetry() {

        setInterval(() => {
            // Next we call a function to set random values for the telemetry
            telemetry.setTelemetrySnapshot(telemetry.getTelemetrySnapShot());
            // Send new updated telemetry to magic leap one
            socket.broadcast.emit('updateTelemetry', telemetry.getTelemetrySnapShot());
            console.log(JSON.stringify(telemetry.getTelemetrySnapShot()));
            console.log('\n \n');
        }, 5000);
        
    })
});
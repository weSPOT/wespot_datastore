//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , fs = require("fs")
    , path = require('path')
    , mongoose = require('mongoose')
    , db = require("./routes/db.js")
//, NanoTimer = require('nanotimer')
//, port = (process.env.PORT || )
    , port = 8082
    , ipadress = process.env.host
    , context = "/datastore"
    , logger = require('morgan')
    , routes = require('./routes/routes.js')
    , _ = require('underscore-node')
    , session = require('express-session')
    , bodyParser = require('body-parser')
    , methodOverride = require('method-override')
    , multer = require('multer')
    , http = require('http')
    ;


//Setup Express
var app = express();

//server.configure(function(){
app.set('port', 8082);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('view options', { layout: false });
app.use(logger('dev'));
//  app.use(connect.bodyParser());
app.use(session({ resave: true,
    saveUninitialized: true,
    secret: 'uwotm8'
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(context, express.static(__dirname + '/static'));
//app.use(express.static(__dirname + '/static'));

//server.use(server.router);
//});
//server.listen( port, ipadress);
//  app.listen(port);

var server = app.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

//var server = http.Server(app);
var ioWeb = io.listen(server);


///////////////////////////////////////////
//              Sockets                  //
///////////////////////////////////////////

//Setup Socket.IO
//var ioWeb = io.listen(server);

// set up the json file to write out the mouse-positions data to file
ioWeb.on('connection', function(socket){



    var emitData = {"Welcome":200};
    socket.emit('server_message', emitData);

    /********* echo ********/
    socket.on('echo', function (data){
        socket.emit('echo_return', data);
    });


});


///////////////////////////////////////////
//         Server Routes                 //
///////////////////////////////////////////



app.get(path.join(context,'/'), routes.index);

app.get(path.join(context, '/events'), getAllEventsJSONP);


app.post(path.join(context, '/event'), storeEvent);

//console.log('Listening on http://' + server.address() + ':' + port );


///////////////////////////////////////////
//         Queries                       //
///////////////////////////////////////////


function getAllEventsJSONP (request, response, next) {
    console.log("getting get request");
    //check if there is a query parameter sensor
    if (_.size(request.query) == 0){

        var query = db.queryAll();
        var promise = query.exec();
        promise.onResolve(function (err, results) {
            if (err)
                console.log("Error: " + err);
            response.jsonp(results);
        });

    } else {
        var query = db.queryAllWithFilter(request.query.username, request.query.verb, request.query.starttime, request.query.endtime, request.query.target, request.query.object, request.query.context);
        var promise = query.exec();
        promise.onResolve(function (err, results) {
            if (err)
                console.log("Error: " + err);
            response.jsonp(results);
        });
    }
}




///////////////////////////////////////////
//         File Upload                   //
///////////////////////////////////////////
function storeEvent(request, response) {
    console.log(request.body);
    try {

        //var received = JSON.parse(request.body);
        var event = new db.Events(request.body,true);
        event.save(function (err, image) {
            if (err) {

                console.error(err);
                response.json({"Error": err});

            }
            else
            {
                response.json({"Success": true});
            }
        });
    }
    catch (e) {

        console.log("Illegal JSON data received.");
        response.json({"Sorry. Failed to upload. Did you include all info?":400});

    }
}


/*
 function storeFile(request, response) {
 console.log(request.body);

 try {

 //var received = JSON.parse(request.body);
 var received = request.body;

 var image = new db.Image();
 image.imageName = received.imageName;
 image.tripID = received.tripID;
 image.userID = received.userID;
 //image.raw = received.raw;

 if (received.userID !== undefined) {

 image.save(function (err, image) {
 if (err) {

 return console.error(err);
 response.json({"Sorry. Failed to upload. Did you include all info?":400});

 } else {
 var save2db = true;
 //if this succeeds, save to disk and add automatically to the tripDATA
 //fs.writeFile("~/node-apps/quantifiedBike/uploads/" + image._id + "_" + received.imageName, new Buffer(received.raw, 'base64'), function(err) {
 fs.writeFile("./uploads/" + image._id + "_" + received.imageName, new Buffer(received.raw, 'base64'), function(err) {
 if(err) {
 console.log(err);
 response.json({"Upload failed":400});
 save2db = false;

 } else {
 console.log("The file was saved!");
 }
 });

 if (save2db){
 db.Trip.findById(received.tripID, function (err, trip) {
 if (err) {
 image.tripID = undefined;
 image.save();
 console.log("damnit! image without existing tripID");
 }

 var dateOfImage;
 if (received.timestamp !== undefined) {
 dateOfImage = received.timestamp;
 } else {
 dateOfImage = new Date();
 }

 var el = {
 "sensorID": 8,   //Check http://ariadne.cs.kuleuven.be/wiki/index.php/PEnO3-1415
 "timestamp": dateOfImage,
 "data": [image._id + "_" + received.imageName]  //free to do anything
 };

 trip.sensorData.push(el);

 //save to database
 trip.save(function (err) {
 if (err) return console.error(err);
 else
 console.log(JSON.stringify(trip));
 });
 });
 response.json({"Upload succeeded":200, "image_id":image._id});
 }
 }


 });


 }

 } catch (e) {

 console.log("Illegal JSON data received.");
 response.json({"Sorry. Failed to upload. Did you include all info?":400});

 }



 }
 */

//var mongo = require('mongodb');

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/qbike');
//mongoose.connect('mongodb://ensor.cs.kuleuven.be:27017/sunshine');
//var server = new Server('ensor.cs.kuleuven.be', 27017, {auto_reconnect: true});

var db_connection = mongoose.connection;
db_connection.on('error', console.error.bind(console, 'connection error:'));
db_connection.once('open', function callback () {

    console.log("Connected to the database");

});


var Schema = mongoose.Schema;

    var tripSchema = new Schema({
        //_id: String,
        groupID: String,
        userID: String,
        startTime: Date,
        endTime: Date,
        meta: {
            distance: Number,       //meters
            averageSpeed: Number,   //km/hour
            maxSpeed: Number,       //km/hour
            other: [Schema.Types.Mixed]  //free to do anything
        },
        sensorData: [
            {
                "sensorID": Number,   //Check http://ariadne.cs.kuleuven.be/wiki/index.php/PEnO3-1415
                "timestamp": Date,
                "data": [Schema.Types.Mixed]  //free to do anything
            }
        ]
    },{collection:"biketrips"});

    var imageSchema = new Schema({
        imageName: String,
        tripID : String,
        userID : String
       // raw: Schema.Types.Mixed  //encode as base64
    },{collection:"files"});

var Trip = mongoose.model('Trip',tripSchema);
var Image = mongoose.model('Image',imageSchema);

exports.Trip = Trip;
exports.Image = Image;

/***************** QUERY METHODS *********************/

var queryAll = function() {

    var query = Trip.find({});
    //query.select({_id: 0});
    return query;
};

var queryAllWithFilter = function(sensorID, groupID, userID, fromDate, toDate){

    var query = Trip.find({});
    if (sensorID !== undefined)
        query.where('sensorData.sensorID',sensorID);
    if (groupID !== undefined)
        query.where('groupID',groupID);
    if (userID !== undefined)
        query.where('userID',userID);

    try {

        if (fromDate !== undefined)
            query.where('startTime').gt(new Date(fromDate));
        if (toDate !== undefined)
            query.where('endTime').lt(new Date(toDate));

    } catch (err){
        console.log(err);
    }
    //query.select({_id: 1});
    return query;
}


var getTripsWithID  = function(identifier) {

    var query = Trip.find({});
    query.where('_id', identifier);
    //query.select({_id: 1});
    return query;

};

var getSensorDataOfTripWithID  = function(identifier) {

    var query = Trip.find({});
    query.where('_id', identifier);
    query.select({_id: 1,tripID: 1, sensorData : 1});
    return query;


};

var getSensorDataWithIDOfTripWithID  = function(sensorID, tripID) {

    var query = Trip.find({});
    query.where('_id', tripID);
    //query.where('sensorData.sensorID', sensorID);
    query.where('sensorData.sensorID').equals(sensorID);
    query.select({_id:1, sensorData:1});
    //query.exec(err, callback());

    return query;
    //return Trip.find({tripID: tripID, 'sensorID' : sensorID},{_id:0, tripID: 1, sensorData : 1},callback());
};


var getImageWithID  = function(identifier) {

    var query = Image.find({});
    query.where('_id', identifier);
    //query.select({_id: 1});
    return query;

};


exports.queryAll = queryAll;
exports.queryAllWithFilter = queryAllWithFilter;
exports.getTripsWithID = getTripsWithID;
exports.getSensorDataOfTripWithID = getSensorDataOfTripWithID;
exports.getSensorDataWithIDOfTripWithID = getSensorDataWithIDOfTripWithID;
exports.getImageWithID = getImageWithID;


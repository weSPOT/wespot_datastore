//var mongo = require('mongodb');

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/datastore');
//mongoose.connect('mongodb://ensor.cs.kuleuven.be:27017/sunshine');
//var server = new Server('ensor.cs.kuleuven.be', 27017, {auto_reconnect: true});

var db_connection = mongoose.connection;
db_connection.on('error', console.error.bind(console, 'connection error:'));
db_connection.once('open', function callback () {

    console.log("Connected to the database");

});


var Schema = mongoose.Schema;

    var eventSchema = new Schema({
        //_id: String,
        id: String,
        verb: String,
        context: {},
        startTime: Date

    },{collection:"events"});



var Event = mongoose.model('Event',eventSchema);

exports.Trip = Event;


/***************** QUERY METHODS *********************/

var queryAll = function() {

    var query = Event.find({});
    //query.select({_id: 0});
    return query;
};

var queryAllWithFilter = function(id, verb, startDate){

    var query = Event.find({});
    if (id !== undefined)
        query.where('id',sensorID);
    if (groupID !== undefined)
        query.where('verb',groupID);

    try {

        if (startDate !== undefined)
            query.where('startDate').gt(new Date(startDate));

    } catch (err){
        console.log(err);
    }
    //query.select({_id: 1});
    return query;
}


var getEventsWithID  = function(identifier) {

    var query = Event.find({});
    query.where('_id', identifier);
    return query;

};




exports.queryAll = queryAll;
exports.queryAllWithFilter = queryAllWithFilter;
exports.getEventsWithID = getEventsWithID;


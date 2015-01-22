//var mongo = require('mongodb');

var mongoose = require('mongoose');

//mongoose.connect('mongodb://localhost/datastore');
mongoose.connect('mongodb://davinci.cs.kuleuven.be:27017/datastore');
//var server = new Server('ensor.cs.kuleuven.be', 27017, {auto_reconnect: true});

var db_connection = mongoose.connection;
db_connection.on('error', console.error.bind(console, 'connection error:'));
db_connection.once('open', function callback () {

    console.log("Connected to the database");

});


var Schema = mongoose.Schema;

var eventSchema = new Schema({
    //_id: String,
    event_id: String,
    username: String,
    verb: String,
    starttime: Date,
    endtime: Date,
    target: String,
    object: String,
    context: Schema.Types.Mixed,
    location: Schema.Types.Mixed,
    originalrequest: Schema.Types.Mixed
},{collection:"events"});


var Events = mongoose.model('event',eventSchema);

exports.Events = Events;

/***************** QUERY METHODS *********************/

var queryAll = function() {

    var query = Events.find({});
    //query.select({_id: 0});
    return query;
};

var queryAllARLearnByString = function() {

    var query = Events.find({context: /ARLearn/});
    //query.select({_id: 0});
    return query;
};

var queryAllWithFilter = function(username, verb, starttime, endtime, target, object, context, phase, subphase){

    var query = Events.find({});
    if (username !== undefined)
        query.where('username',username);
    if (verb !== undefined)
        query.where('verb',verb);
    if (target !== undefined)
        query.where('target',target);
    if (object !== undefined)
        query.where('object',object);
    if (context !== undefined){
        query.or([{ 'context': context }, { 'context.course': context }]);
    }
    if (phase !== undefined){
        query.where('context.phase',phase);
    }

    if (subphase !== undefined){
        query.where('context.subphase',subphase);
    }

    try {

        if (starttime !== undefined)
            query.where('starttime').gt(new Date(starttime));
        if (endtime !== undefined)
            query.where('endtime').lt(new Date(endtime));

    }
    catch (err){
        console.log(err);
    }

    return query;
};


exports.queryAll = queryAll;
exports.queryAllWithFilter = queryAllWithFilter;
exports.queryAllARLearnByString = queryAllARLearnByString;
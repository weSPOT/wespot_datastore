//setup Dependencies
var fs = require('fs')
    , jsoncsv = require('json-csv')
    , express = require('express')
    , csv = require('express-csv')
    , connect = require('connect')
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

app.use(bodyParser.urlencoded({ type: '*/x-www-form-urlencoded', extended: true }));
app.use(bodyParser.text({limit: '20mb'}));
app.use(bodyParser.json({type: 'application/*+json', limit: '20mb'}));

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

/*app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});*/

app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    //res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get(path.join(context,'/'), routes.index);

app.get(path.join(context, '/events'), getAllEventsJSONP);
app.get(path.join(context, '/eventsCsv'), getAllEventsCSV);
//app.get(path.join(context, '/duplicateContext'), duplicateContext);
//app.get(path.join(context, '/refactoringData'), refactoringData3);
//app.get(path.join(context, '/removeduplicatesslack'), refactoringRemoveDuplicatesSlack);
app.post(path.join(context, '/event'), storeEvent);
app.post(path.join(context, '/rest/pushEvent'), storeEventw);
app.post(path.join(context, '/events'), storeEvents);
app.post(path.join(context, '/eventc'), storeEventc);


//console.log('Listening on http://' + server.address() + ':' + port );


///////////////////////////////////////////
//         Queries                       //
///////////////////////////////////////////


function getAllEventsCSV (request, response, next) {
    var header=request.headers['authorization'];
    console.log("getting get request");
    //check if there is a query parameter sensor
    if (_.size(request.query) == 0) {

        var query = db.queryAll();
        var promise = query.exec();
        promise.onResolve(function (err, results) {
            if (err)
                console.log("Error: " + err);
            response.jsonp(results);
        });

    } else {
        var query = db.queryAllWithFilter(request.query.username, request.query.verb, request.query.starttime, request.query.endtime, request.query.target, request.query.object, request.query.context);
        var promise = null;
        var limit = 1000;
        if (request.query.limit != null) {
            limit = request.query.limit;
        }
        if (request.query.page != null) {
            page = request.query.page;
            promise = query.limit(limit).skip(page * limit).exec();
        } else {
            promise = query.exec();
        }
        promise.onResolve(function (err, results) {
            for (i = 0; i < results.length; i++) {
                results[i].starttimelong = results[i].starttime.getTime();
            }
            if (err)
                console.log("Error: " + err);

            jsoncsv.csvBuffered(
                    results,{
                    fields : [
                        {
                            name : 'username',
                            label : 'username'
                        },
                        {
                            name : 'starttimelong',
                            label : 'time'
                        },
                        {
                            name : 'verb',
                            label : 'verb'
                        },
                        {
                            name : 'context.course',
                            label : 'inquiry'
                        },
                        {
                            name : 'context.phase',
                            label : 'phase'
                        },
                        {
                            name : 'context.widget_type',
                            label : 'widget'
                        },
                        {
                            name : 'object',
                            label : 'url'
                        },
                        {
                            name : 'originalrequest.value',
                            label : 'value'
                        }

                    ]},
                function(err,csv) {
                    var result = String(csv).replace(/\[object object\]/gi,'');
                    response.send(result);
                }
            );
        });
    }
}



function duplicateContext(request, response, next) {
    var header=request.headers['authorization'];
    console.log("getting get request");
    //LARAe -> 9IywPIjfdlE7gh9T2vj523BTqu2YRkVe
    //Diagnostic Instrument -> DDr8yQIDHVaL4ogvV6YP0gtPvA0UnL6e
    if (header!='9IywPIjfdlE7gh9T2vj523BTqu2YRkVe' && header!='DDr8yQIDHVaL4ogvV6YP0gtPvA0UnL6e' ){
        response.statusCode = 401;
        response.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
        response.end('Unauthorized');
    }else {
        //check if there is a query parameter sensor
        if (_.size(request.query) == 0) {
            var query = db.queryAll();
            var promise = query.exec();
            promise.onResolve(function (err, results) {
                if (err)
                    console.log("Error: " + err);
                response.json({"Error": "missing parameters"});
            });
        } else {
            if (request.query.context !== undefined && request.query.newcontext !== undefined) {
                var query = db.queryAllWithFilter(undefined, undefined, undefined, undefined, undefined, undefined, request.query.context, request.query.phase, request.query.subphase);
                var promise = null;
                var limit = 1000;
                if (request.query.limit != null) {
                    limit = request.query.limit;
                }
                if (request.query.page != null) {
                    page = request.query.page;
                    promise = query.limit(limit).skip(page * limit).exec();
                } else {
                    promise = query.exec();
                }

                promise.onResolve(function (err, results) {
                    var error = "";
                    for (i = 0; i < results.length; i++) {
                        var newEvent = results[i].toJSON();
                        newEvent.context.course = request.query.newcontext;
                        if (request.query.newphase !== undefined)
                            newEvent.context.phase = request.query.newphase;
                        delete newEvent._id;
                        delete newEvent.__v;
                        var event = new db.Events(newEvent, true);
                        console.log(newEvent);
                        event.save(function (err, image) {
                            if (err) {
                                console.log(newEvent);
                                console.error(err);
                                error += err;
                            }
                            else
                                console.log({"Success": true});
                        });
                    }
                    if (err) {
                        console.log("Error: " + err);
                        error += err;
                    }
                    if (error == "") {
                        response.jsonp({"Success": true});
                    } else {
                        response.jsonp({"error": error});
                    }
                    //response.jsonp(results);
                });
            }
        }
    }

}

function getAllEventsJSONP (request, response, next) {
    var header=request.headers['authorization'];
    console.log("getting get request");
    //LARAe -> 9IywPIjfdlE7gh9T2vj523BTqu2YRkVe
    //Diagnostic Instrument -> DDr8yQIDHVaL4ogvV6YP0gtPvA0UnL6e
    if (header!='9IywPIjfdlE7gh9T2vj523BTqu2YRkVe' && header!='DDr8yQIDHVaL4ogvV6YP0gtPvA0UnL6e' ){
        response.statusCode = 401;
        response.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
        response.end('Unauthorized');
    }else {
        //check if there is a query parameter sensor
        if (_.size(request.query) == 0) {

            var query = db.queryAll();
            var promise = query.exec();
            promise.onResolve(function (err, results) {
                if (err)
                    console.log("Error: " + err);
                response.jsonp(results);
            });

        } else {
            var query = db.queryAllWithFilter(request.query.username, request.query.verb, request.query.starttime, request.query.endtime, request.query.target, request.query.object, request.query.context, request.query.phase, request.query.subphase);
            var promise = null;
            var limit = 1000;
            if (request.query.limit != null) {
                limit = request.query.limit;
            }
            if (request.query.page != null) {
                page = request.query.page;
                promise = query.limit(limit).skip(page * limit).exec();
            } else {
                promise = query.exec();
            }
            promise.onResolve(function (err, results) {
                if (err)
                    console.log("Error: " + err);
                response.jsonp(results);
            });
        }
    }
}


function storeEvent(request, response) {
    var header = request.headers['authorization'];
    console.log("getting post request");
    if (header != '9IywPIjfdlE7gh9T2vj523BTqu2YRkVe') {
        response.statusCode = 401;
        response.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
        response.end('Unauthorized');
    } else {
        console.log(request.body);
        try {
            var query = db.queryAllWithFilter(request.body.username, request.body.verb, request.body.starttime, request.body.endtime, request.body.target, request.body.object, request.body.context, undefined, undefined);

            promise.onResolve(function (err, results) {
                if (err)
                    console.log("Error: " + err);
                //var received = JSON.parse(request.body);
                if (results.length > 0) return response.json({"Success": true});
                var event = new db.Events(request.body, true);
                event.save(function (err, image) {
                    if (err) {

                        console.error(err);
                        response.json({"Error": err});

                    }
                    else {
                        response.json({"Success": true});
                    }
                });
            });
        }
        catch (e) {

            console.log("Illegal JSON data received.");
            response.json({"Sorry. Failed to upload. Did you include all info?": 400});

        }
    }
}

function storeEventw(request, response) {
    /*var header = request.headers['authorization'];
    console.log("getting post request");
    if (header != '9IywPIjfdlE7gh9T2vj523BTqu2YRkVe') {
        response.statusCode = 401;
        response.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
        response.end('Unauthorized');
    } else {*/
        console.log(request.body);
        try {

            //var received = JSON.parse(request.body);
            var event = new db.Events(request.body, true);
            event.save(function (err, image) {
                if (err) {

                    console.error(err);
                    response.json({"Error": err});

                }
                else {
                    response.json({"Success": true});
                }
            });
        }
        catch (e) {

            console.log("Illegal JSON data received.");
            response.json({"Sorry. Failed to upload. Did you include all info?": 400});

        }
    //}
}

function storeEvents(request, response) {
        var header=request.headers['authorization'];
        console.log("getting post request");
        if (header!='9IywPIjfdlE7gh9T2vj523BTqu2YRkVe'){
            response.statusCode = 401;
            response.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
            response.end('Unauthorized');
        }else {
            console.log(request.body);
            try {
                var received = request.body;

                for(var i in received) {

                    var event = new db.Events(received[i], true);
                    event.save(function (err, image) {
                        if (err) {//throw err;//handle error
                            console.log('error message:'+err);
                            console.log('object:'+event)
                        }
                    });
                }
                response.json({"Success": true});
            }
            catch (e) {
                console.log("Illegal JSON data received."+e);
                response.json({"Sorry. Failed to upload. Did you include all info?": 400});

            }
        }
    }


function storeEventc(request, response) {
    var header=request.headers['authorization'];
    var host=request.headers['origin'];
    if (host=='http://localhost:8888' || host=='http://openbadgesapi.appspot.com' || host=='http://ariadne.cs.kuleuven.be') {
        console.log(request.headers);
        console.log(host);
        console.log("getting post request");
        console.log(request.body);
        try {
            //var received = JSON.parse(request.body);
            var event = new db.Events(request.body, true);
            event.save(function (err, image) {
                if (err) {

                    console.error(err);
                    response.json({"Error": err});

                }
                else {
                    response.json({"Success": true});
                }
            });
        }
        catch (e) {

            console.log("Illegal JSON data received.");
            response.json({"Sorry. Failed to upload. Did you include all info?": 400});

        }
    }
}

///////////////////////////////////////////
//         File Upload                   //
///////////////////////////////////////////

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

/*function changeContext(request, response, next){
    var query = db.queryAllARLearnByString();
    var promise = null;
    var limit = 1400;
    if (request.query.limit != null) {
        limit = request.query.limit;
    }
    if (request.query.page != null) {
        page = request.query.page;
        promise = query.limit(limit).skip(page * limit).exec();
    } else {
        promise = query.exec();
    }
    var contador = 0;
    promise.onResolve(function (err, results) {
        var error = "";

        console.log("LEngth result:"+results.length);
        for (i = 0; i < results.length; i++) {
            var json = results[i].toJSON();
            var context = results[i].toJSON().originalrequest.responseValue;
            //console.log(json);
            try {
                var newContext = JSON.parse(context);
                console.log(json._id);
                delete json.originalrequest.responseValue;
                delete json._id;
                delete json.__v;
                json.originalrequest.responseValue = newContext;

                contador++;
                var event = new db.Events(json, true);
                 event.save(function (err, image) {
                 if (err) {
                 console.log(newEvent);
                 console.error(err);
                 error += err;
                 }
                 else
                 console.log({"Success": true});
                 });
            }catch(err) {
                console.log("originalrequest.responseValue is an object")
            }
        }
        console.log(contador);
    });

}*/


function giveEquivalent(subphase){
    if (subphase=='filerepo') return 'files';
    else if (subphase=='file') return 'files';
    else if (subphase=='wespot_mindmeister') return 'mindmaps';
    else if (subphase=='mindmeistermap') return 'mindmaps';
    else if (subphase=='answers') return 'questions';
    else if (subphase=='answer') return 'questions';
    else if (subphase=='question') return 'questions';
    else if (subphase=='questions') return 'questions';
    else if (subphase=='group_forum_topics') return 'discussion';
    else if (subphase=='groupforumtopic') return 'discussion';
    else if (subphase=='wespot_arlearn') return 'data_collection';
    else if (subphase=='data_collection') return 'data_collection'; //This tag was defined for the ARLearn tracker, but the rest come from elgg
    else if (subphase=='arlearn') return 'data_collection';
    else if (subphase=='arlearntask') return 'data_collection';
    else if (subphase=='hypothesis') return 'hypothesis';
    else if (subphase=='hypothesis_top') return 'hypothesis';
    else if (subphase=='pages') return 'pages';
    else if (subphase=='page') return 'pages';
    else if (subphase=='blog') return 'blog';
    else if (subphase=='conclusions') return 'conclusions';
    else if (subphase=='notes') return 'notes';
    else if (subphase=='reflection') return 'reflection';
    else if (subphase=='recommedationplugin') return 'recommendationPlugin';
    return null;
}
function refactoringData(request, response, next){
    var query = db.queryAll();
    var promise = null;
    var limit = null;
    promise = query.exec();

    var contador = 0;
    promise.onResolve(function (err, results) {
        var error = "";

        console.log("LEngth result:"+results.length);
        for (i = 0; i < results.length; i++) {
            var json = results[i].toJSON();
            if (results[i].toJSON().hasOwnProperty('context')) {
                var context = results[i].toJSON().context;
                if ((!context.hasOwnProperty('widget_type'))&&context.hasOwnProperty('phase')&&context.hasOwnProperty('subphase')){
                    //console.log(json);
                    try {
                        if (giveEquivalent(context.subphase.toLowerCase())==null)
                            context.widget_type=null;
                        else context.widget_type=giveEquivalent(context.subphase.toLowerCase());

                        delete json._id;
                        delete json.__v;
                        delete json.context;
                        json.context = context;
                        contador++;
                        if (context.widget_type==null&&context.subphase!='reinforcement'&&context.subphase!='assessment'
                            &&context.course!='arLearn-fake'&&context.subphase!='Information foraging')
                            console.log(context);

                        results[i].remove();

                        var event = new db.Events(json, true);
                        event.save(function (err, image) {
                            if (err) {
                                console.log(json);
                                console.error(err);
                                error += err;
                            }
                            else
                                console.log({"Success": true});
                        });
                    } catch (err) {
                        console.log(err)
                    }
                }
            }
        }
        console.log(contador);
    });

}

function refactoringData2 (request, response, next){
    var query = db.queryAll();
    var promise = null;
    var limit = null;
    promise = query.exec();

    var contador = 0;
    promise.onResolve(function (err, results) {
        var error = "";

        console.log("LEngth result:"+results.length);
        for (i = 0; i < results.length; i++) {
            var json = results[i].toJSON();
            if (results[i].toJSON().hasOwnProperty('context')) {
                var context = results[i].toJSON().context;
                if (context.hasOwnProperty('phase')&&context.hasOwnProperty('subphase')&&(context.subphase=='data_collection')){
                    //console.log(json);
                    try {
                        if (giveEquivalent(context.subphase.toLowerCase())==null)
                            context.widget_type=null;
                        else context.widget_type=giveEquivalent(context.subphase.toLowerCase());

                        delete json._id;
                        delete json.__v;
                        delete json.context;
                        json.context = context;
                        contador++;
                        if (context.widget_type==null&&context.subphase!='reinforcement'&&context.subphase!='assessment'
                            &&context.course!='arLearn-fake'&&context.subphase!='Information foraging')
                            console.log(context);

                        results[i].remove();

                        var event = new db.Events(json, true);
                        event.save(function (err, image) {
                            if (err) {
                                console.log(json);
                                console.error(err);
                                error += err;
                            }
                            else
                                console.log({"Success": true});
                        });
                    } catch (err) {
                        console.log(err)
                    }
                }
            }
        }
        console.log(contador);
    });

}

function refactoringData3 (request, response, next){
    var query = db.queryAllWithFilter(undefined, undefined, undefined, undefined, undefined, undefined, '82011', '3', undefined);
    var promise = null;
    var limit = null;
    promise = query.exec();

    var contador = 0;
    promise.onResolve(function (err, results) {
        var error = "";

        console.log("LEngth result:"+results.length);
        for (i = 0; i < results.length; i++) {
            var json = results[i].toJSON();
            var context = results[i].toJSON().context;
            //console.log(json);
            try {
                context.phase = '1';

                delete json._id;
                delete json.__v;
                delete json.context;
                json.context = context;
                contador++;

                console.log(json);
                results[i].remove();

                var event = new db.Events(json, true);
                event.save(function (err, image) {
                    if (err) {
                        console.log(json);
                        console.error(err);
                        error += err;
                    }
                    else
                        console.log({"Success": true});
                });
            } catch (err) {
                console.log(err)
            }
        }
        console.log(contador);
    });

}

function refactoringRemoveDuplicatesSlack (request, response, next){
    console.log("get data");

    var query = db.queryAllWithFilter(undefined, undefined, undefined, undefined, undefined, undefined, 'C02H3MPCR', undefined, undefined);
    var promise = null;
    var limit = null;
    promise = query.limit(50000).exec();

    var contador = 0;
    promise.onResolve(function (err, results) {
        var error = "";
        var identifiers = {};
        console.log("LEngth result:"+results.length);
        for (i = 0; i < results.length; i++) {
            var json = results[i].toJSON();
            var id = results[i].username + results[i].context + results[i].starttime;

            try {
                contador++;
                if (!identifiers.hasOwnProperty(id))
                    identifiers[id] = 1;
                else {
                    identifiers[id] = identifiers[id] + 1;
                    results[i].remove();
                }
                console.log('Repeated identifiers: '+identifiers[id]);
            } catch (err) {
                console.log(err)
            }
        }
        console.log(contador);
    });

}
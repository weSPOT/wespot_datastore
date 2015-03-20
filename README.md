# Data Store for learning analytics events

## Installation

- Install Node JS: https://nodejs.org/
- Download our app: all the modules are also included in GitHub - check modules folder.
- mongodb: modify the URL of your mongodb in the following file: routes/db.js
- Execute the datastore: node start DS_server.js

## Services definition

The main services defined are:

### Get events

* app.get(path.join(context, '/events'), getAllEventsJSONP) 
   - You can add all the parameters defined in the Schema (see bellow)

### Store events

* app.post(path.join(context, '/event'), storeEvent); 
    - Push single events
* app.post(path.join(context, '/events'), storeEvents); 
    - Push array of events

If you want to avoid the cross-domain problem with JavaScript, you can use the following service and add your host to the list of allowed hosts:

* app.post(path.join(context, '/eventc'), storeEventc);

## Schema definition

see file routes/db.js

The schema definition is a simplification of xAPI: https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md

The schema is defined as:



    var eventSchema = new Schema({
    
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

   



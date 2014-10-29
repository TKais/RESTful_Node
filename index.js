var http = require('http'),        //library for creation of the server
    express = require('express');  //library for the express framework, which is what sinatra/rails is to Ruby
    path = require('path');
    MongoClient = require('mongodb').MongoClient,  //includes the MongoClient object from the MongoDB module
    Server = require('mongodb').Server,   //includes the Server object from the MongoDB module
    CollectionDriver = require('./collectionDriver').CollectionDriver;  //includes newly-created collectionDriver
 
var app = express();    //variable to hold express package
app.set('port', process.env.PORT || 3000);   //sets the port to 3000
app.set('views', path.join(__dirname, 'views')); //sets where the view templates live
app.set('view engine', 'jade'); //sets jade as the templating engine

//do all 'sets' first before 'use'; everything works in order
var mongoHost = 'localHost'; //A
var mongoPort = 27017; 
var collectionDriver;
 
var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //B
mongoClient.open(function(err, mongoClient) { //C
  if (!mongoClient) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1); //D
  }
  var db = mongoClient.db("MyDatabase");  //E
  collectionDriver = new CollectionDriver(db); //F
});

// Line A above assumes the MongoDB instance is running locally on the default port of 27017. If you ever run a MongoDB server elsewhere you’ll have to modify these values, but leave them as-is for this tutorial.
// Line B creates a new MongoClient and the call to open in line C attempts to establish a connection. If your connection attempt fails, it is most likely because you haven’t yet started your MongoDB server. In the absence of a connection the app exits at line D.
// If the client does connect, it opens the MyDatabase database at line E. A MongoDB instance can contain multiple databases, all which have unique namespaces and unique data. Finally, you create the CollectionDriver object in line F and pass in a handle to the MongoDB client.

app.use(express.static(path.join(__dirname, 'public')));  //static files from express
 
app.get('/', function (req, res) {
  res.send('<html><body><h1>Hello World</h1></body></html>'); //routing for the index page. No request necessary since you're just appending text to a page.
});

app.use(function (req,res) {
    res.render('404', {url:req.url});  //a catch-all 404 if no content is returned. app.use means it applies to all pages
});
 
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));   //actually creates the server
});





// --------------------------------------------------------------------------------------------------------------




//THIS IS HOW YOU PULL DATA FROM MONGODB AND CREATE ROUTES-------------------------------------------
// app.get('/:collection', function(req, res) { //A
//    var params = req.params; //B
//    collectionDriver.findAll(req.params.collection, function(error, objs) { //C
//         if (error) { res.send(400, error); } //D
//         else { 
//             if (req.accepts('html')) { //E
//                 res.render('data',{objects: objs, collection: req.params.collection}); //F
//               } else {
//             res.set('Content-Type','application/json'); //G
//                   res.send(200, objs); //H
//               }
//          }
//     });
// });
 
// app.get('/:collection/:entity', function(req, res) { //I
//    var params = req.params;
//    var entity = params.entity;
//    var collection = params.collection;
//    if (entity) {
//        collectionDriver.get(collection, entity, function(error, objs) { //J
//           if (error) { res.send(400, error); }
//           else { res.send(200, objs); } //K
//        });
//    } else {
//       res.send(400, {error: 'bad url', url: req.url});
//    }
// });


// This creates two new routes: /:collection and /:collection/:entity. These call the collectionDriver.findAll and collectionDriver.get methods respectively and return either the JSON object or objects, an HTML document, or an error depending on the result.
// When you define the /collection route in Express it will match “collection” exactly. However, if you define the route as /:collection as in line A then it will match any first-level path store the requested name in the req.params. collection in line B. In this case, you define the endpoint to match any URL to a MongoDB collection using findAll of CollectionDriver in line C.
// If the fetch is successful, then the code checks if the request specifies that it accepts an HTML result in the header at line E. If so, line F stores the rendered HTML from the data.jade template in response. This simply presents the contents of the collection in an HTML table.
// By default, web browsers specify that they accept HTML in their requests. When other types of clients request this endpoint such as iOS apps using NSURLSession, this method instead returns a machine-parsable JSON document at line G. res.send() returns a success code along with the JSON document generated by the collection driver at line H.
// In the case where a two-level URL path is specified, line I treats this as the collection name and entity _id. You then request the specific entity using the get() collectionDriver‘s method in line J. If that entity is found, you return it as a JSON document at line K.


// Save your work, restart your Node instance, check that your mongod daemon is still running and point your browser at http://localhost:3000/items;
// You'll see items on the page




// --------------------------------------------------------------------------------------------------------------






//ALTERNATIVE WAY TO CREATE THE SERVER
// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   res.end('<html><body><h1>Hello World</h1></body></html>');
// }).listen(3000);
 
// console.log('Server running on port 3000.');


//TYPE THIS INTO TERMINAL TO ALLOW MONGODB DRIVER TO PROVIDE DATABASE CONNECTIVITY
//cd /usr/local/opt/mongodb/ 
//mongod




// --------------------------------------------------------------------------------------------------------------



//GREAT EXAMPLE OF CALLBACKS
// var fs = require('fs')
// var myNumber = undefined

// function addOne(callback) {
//   fs.readFile('number.txt', function doneReading(err, fileContents) {
//     myNumber = parseInt(fileContents)
//     myNumber++
//     callback()
//   })
// }

// function logMyNumber() {
//   console.log(myNumber)
// }

// addOne(logMyNumber)

// 1: the code is parsed, which means if there are any syntax errors they would make the program break. During this initial phase there are 4 things that get defined: fs, myNumber, addOne, and logMyNumber. Note that these are just being defined, no functions have been called/invoked yet.
// 2: When the last line of our program gets executed addOne gets invoked, getting passed in the logMyNumber function as callback, which is what we want to be called when addOne is complete. This immediately causes the asynchronous fs.readFile function to kick off. This part of the program takes a while to finish.
// 3: with nothing to do, node idles for a bit as it waits for readFile to finish. If there was anything else to do during this time, node would be available for work.
// 4: readFile finishes and calls its callback, doneReading, which then in turn increments the number and then immediately invokes the function that addOne passed in (its callback), logMyNumber.

//processFile depends on readFile finishing, and that's what callbacks are for. 
//CAN BE WRITTEN LIKE:
//var fs = require('fs')
// fs.readFile('movie.mp4', finishedReading)

// function finishedReading(error, movieData) {
//   if (error) return console.error(error)
//   // do something with the movieData
// }
//OR
// var fs = require('fs')

// function finishedReading(error, movieData) {
//   if (error) return console.error(error)
//   // do something with the movieData
// }

// fs.readFile('movie.mp4', finishedReading)
//OR
// var fs = require('fs')

// fs.readFile('movie.mp4', function finishedReading(error, movieData) {
//   if (error) return console.error(error)
//   // do something with the movieData
// })


//callback functions are closures
//Defining an Error-First Callback

// There’s really only one rule for using an error-first callback:

// The first argument of the callback is always reserved for an error object. The following arguments will contain any other data that should be returned to the callback. There is almost always just one object following ‘err’, but you can use multiple arguments if truely needed.
// Example: function(err, data)
// When it’s time to call an error-first callback, there are two scenarios you’ll need to handle:

// On a successful response, the ‘err’ argument is null. Call the callback and include the successful data only.
// Example: callback(null, returnData);

// On an unsuccessful response, the ‘err’ argument is set. Call the callback with an actual error object. The error should describe what happened and include enough information to tell the callback what went wrong. Data can still be returned in the other arguments as well, but generally the error is passed alone.
// Example: callback( new Error('Bad Request') );

//EXAMPLE OF ERROR-FIRST CALLBACK
// fs.readFile('/foo.txt', function(err, data) {
//   if (err) {
//       console.log('Ahh! An Error!');
//       return;
//   }
//   console.log(data);
// });

// --Functions in JavaScript are actually objects (Function objects)
// --The distinction between code and data is sometimes blurred
// --One benefit of this function-as-object concept is that you can pass code to another function in the same way you would pass a regular variable or object (because the code is literally just an object)
// --Functions are essentially mappings between input and output
// --Rather than wait around for a function to finish by returning a value, we can use callbacks to do it asynchronously. This is useful for things that take a while to finish, like making an AJAX request, because we aren’t holding up the browser
// --Node.js, being an asynchronous platform, doesn't wait around for things like file I/O to finish - Node.js uses callbacks
// --function asyncOperation ( a, b, c, callback ) {
//   // ... lots of hard work ...
//   if ( /* an error occurs */ ) {
//     return callback(new Error("An error has occured"));
//   }
//   // ... more work ...
//   callback(null, d, e, f);
// }

// asyncOperation ( params.., function ( err, returnValues.. ) {
//    //This code gets run after the async operation gets run
// });
// --You will almost always want to follow the error callback convention, since most Node.js users will expect your project to follow them. The general idea is that the callback is the last parameter. The callback gets called after the function is done with all of its operations. Traditionally, the first parameter of the callback is the error value. If the function hits an error, then they typically call the callback with the first parameter being an Error object. If it cleanly exits, then they will call the callback with the first parameter being null and the rest being the return value(s)

// --Callbacks are functions that use another function as a parameter so that it doesn't wait around for an actual return; it keeps doing other things.
// OWN EXAMPLE
// So a function reads a csv and must return every instance of the word "the". It uses fs to read the file (the csv being the first argument in the function) and it has a second parameter, which is the callback function. The callback typically takes two arguments -- error, and whatever the successful return is. 
// Reading the csv can take awhile, so it will run through continuously until the csv is read, while still doing other tasks if it needs to. When the csv is read, it will call the callback and return either an error or the successful return.
//so if it doesn't error out, it will call the callback within the function, which is to return all the "the's" and maybe make them green or red when appended to the page.
// This is asynchronous, and allows JS to go do other things while that csv is read. The callback is only called when the csv is fully read. 

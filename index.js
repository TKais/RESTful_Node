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

//do all sets first before 'use'; everything works in order
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
  res.send('<html><body><h1>Hello World</h1></body></html>'); //routing for the index page
});

app.use(function (req,res) {
    res.render('404', {url:req.url});  //a catch-all 404 if no content is returned. app.use means it applies to all pages
});
 
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));   //actually creates the server
});


//ALTERNATIVE WAY TO CREATE THE SERVER
// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   res.end('<html><body><h1>Hello World</h1></body></html>');
// }).listen(3000);
 
// console.log('Server running on port 3000.');


//TYPE THIS INTO TERMINAL TO ALLOW MONGODB DRIVER TO PROVIDE DATABASE CONNECTIVITY
//cd /usr/local/opt/mongodb/ 
//mongod








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

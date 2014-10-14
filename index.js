var http = require('http'),        //library for creation of the server
    express = require('express');  //library for the express framework, which is what sinatra/rails is to Ruby
    path = require('path');
 
var app = express();    //variable to hold express package
app.set('port', process.env.PORT || 3000);   //sets the port to 3000
app.set('views', path.join(__dirname, 'views')); //sets where the view templates live
app.set('view engine', 'jade'); //sets jade as the templating engine

//do all sets first before 'use'; everything works in order

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

// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   res.end('<html><body><h1>Hello World</h1></body></html>');
// }).listen(3000);
 
// console.log('Server running on port 3000.');
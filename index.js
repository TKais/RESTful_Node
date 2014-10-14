var http = require('http'),
    express = require('express');
    path = require('path');
 
var app = express();
app.set('port', process.env.PORT || 3000); 
app.set('views', path.join(__dirname, 'views')); //sets where the view templates live
app.set('view engine', 'jade'); //sets jade as the templating engine

app.use(express.static(path.join(__dirname, 'public')));  //static files from express
 
app.get('/', function (req, res) {
  res.send('<html><body><h1>Hello World</h1></body></html>');
});

app.use(function (req,res) {
    res.render('404', {url:req.url});
});
 
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   res.end('<html><body><h1>Hello World</h1></body></html>');
// }).listen(3000);
 
// console.log('Server running on port 3000.');
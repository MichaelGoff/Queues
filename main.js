var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next)
{
	console.log(req.method, req.url);

	// ... INSERT HERE.
  client.lpush("queue", req.method + ' ' + req.url);
  client.ltrim("queue", 0, 4);

	next(); // Passing the request to the next handler in the stack.
});

app.get('/', function(req, res) {
  res.send('hello world')
});

app.get('/get', function(req, res) {
  client.get("key", function(err, value) {res.send(value)});
});

app.get('/set', function(req, res) {
    client.set("key", "this message will self-destruct in 10 seconds.");
    res.send('key set');
    client.expire("key", 10);

});

app.get('/recent', function(req, res) {
  client.lrange("queue", 0, -1, function(err, value) {
    console.log(value);
    res.send(value)}
  );

});


app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log(req.body) // form fields
   console.log(req.files) // form files

   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
	  		console.log(img);

        client.lpush("images", img);
		});
	}

   res.status(204).end()
}]);

app.get('/meow', function(req, res) {
	client.lrange("images", 0, 0, function(err, items) {
    if (err) throw err
		res.writeHead(200, {'content-type':'text/html'});
		items.forEach(function (imagedata)
		{
   		res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");
		});
   	res.end();
	});
  client.ltrim("images", 1, -1);
})

// HTTP SERVER
var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})


Cache, Proxies, Queues
=========================

### Conceptual Questions

1. Describe some benefits and issues related to using Feature Flags.
    - Some benefits to using feature flags include the ability to provide tiered releases so you can just trip the flag for small groups of users at a time until everyone is using the feature. You can also quickly turn off a feature if it turns out to not work very well for users. Some drawbacks are an increase in technical debt because once you have the feature fully implemented you need to remove the flag code. Another drawback are strange interactions that can occur if one feature is turned off that another feature depends upon which can cause additional errors. 
2. What are some reasons for keeping servers in seperate availability zones?
    - In case there is a geographic issue in one area you can still have availability for your application as things can redirect to another server region. You can also reduce latency when you host in different areas since users can connect to the closest server rather than having to connect across the world. 
3. Describe the Circuit Breaker pattern and its relation to operation toggles.
    - The circuit breaker pattern wraps calls to remote services and monitor for failures. If enough failures occur the breaker trips which then returns an error for any additional calls to the breaker and prevents the protected call from being made at all. This will prevent many calls waiting for a timeout from the server. 
4. What are some ways you can help speed up an application that has
   - a) traffic that peaks on Monday evenings
       - Spin up some additional servers during Monday evenings to help handle the additional load. 
   - b) real time and concurrent connections with peers
       - Implement regional servers so users will connect to the server they have the best connection with which helps reduce latency.
   - c) heavy upload traffic
       - Use a 3rd party service to handle large files so you don't have to tax your own servers with handling lots of data at once which can help to prevent DDOS attacks.
       
## Video Link
[Click here for Screencast](https://youtu.be/BTm16DnPcsM)



### Setup

* Clone this repo, run `npm install`.
* Install redis and run on localhost:6379

### A simple web server

Use [express](http://expressjs.com/) to install a simple web server.

	var server = app.listen(3000, function () {
	
	  var host = server.address().address
	  var port = server.address().port
	
	  console.log('Example app listening at http://%s:%s', host, port)
	})

Express uses the concept of routes to use pattern matching against requests and sending them to specific functions.  You can simply write back a response body.

	app.get('/', function(req, res) {
	  res.send('hello world')
	})

### Redis

You will be using [redis](http://redis.io/) to build some simple infrastructure components, using the [node-redis client](https://github.com/mranney/node_redis).

	var redis = require('redis')
	var client = redis.createClient(6379, '127.0.0.1', {})

In general, you can run all the redis commands in the following manner: client.CMD(args). For example:

	client.set("key", "value");
	client.get("key", function(err,value){ console.log(value)});

### An expiring cache

Create two routes, `/get` and `/set`.

When `/set` is visited, set a new key, with the value:
> "this message will self-destruct in 10 seconds".

Use the expire command to make sure this key will expire in 10 seconds.

When `/get` is visited, fetch that key, and send value back to the client: `res.send(value)` 


### Recent visited sites

Create a new route, `/recent`, which will display the most recently visited sites.

There is already a global hook setup, which will allow you to see each site that is requested:

	app.use(function(req, res, next) 
	{
	...

Use the lpush, ltrim, and lrange redis commands to store the most recent 5 sites visited, and return that to the client.

### Cat picture uploads: queue

Implement two routes, `/upload`, and `/meow`.
 
A stub for upload and meow has already been provided.

Use curl to help you upload easily.

	curl -F "image=@./img/morning.jpg" localhost:3000/upload

Have `upload` store the images in a queue.  Have `meow` display the most recent image to the client and *remove* the image from the queue. Note, this is more like a stack.

### Proxy server

Bonus: How might you use redis and express to introduce a proxy server?

See [rpoplpush](http://redis.io/commands/rpoplpush)

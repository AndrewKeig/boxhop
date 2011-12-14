var config = require('./config');
var channels = require('./channels');
var express = require('express');
var util = require('util');
var http = require('http');
var events = require("events");
var io = require('socket.io');
var app = express.createServer();

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: false, showStack: false }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

app.get('/', function (req, res) {
    res.render('index', {
        title: config.title,
        logo: config.logo
    });
});

//app.get('/channel/:tag', function(req, res){
//  selectedChannel = req.params.tag;
//  res.render('index', {
//    title: req.params.tag,
//    logo: config.logo
//  });
//});

app.listen(3000);
io = io.listen(app);

io.sockets.on('connection', function (client) {

    //client has connected
    client.on('ready', function (message) {
        console.log('client ready to go');
        console.log(message);
    });

    //client has request channel results
    client.on('channel', function (req) {
        console.log('changing channel: ' + req.channel);

        //this shows how to client; passing a callback
        //io.sockets.in(channels.selected.name)
        // .emit('inChannel', channels.selected.name);

        //get channel request
        var request = channels.request(req);

        request.addListener("response", function (response) {
            var body = "";

            response.addListener("data", function (data) {
                body += data;
            });

            //send tracks to client
            response.addListener("end", function (end) {
                var tracks = channels.selected.parse(body);

                if (tracks.length > 0) {
                    console.log('sending tracks to client');
                    client.emit('tracks', { items: tracks});
                }
            });
        });
        request.end();
    });

  //when a client has disconnected; i.e. closed browser
    client.on('disconnect', function () {
        console.log('Client Disconnected..');
    });
});

console.log("Express on port %d in %s mode", app.address().port, app.settings.env);
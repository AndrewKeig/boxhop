var config = require('./config/config');
var channel = require('./channel');
var mongoose = require('mongoose');
var user = require('./core/user');
var express = require('express');
//var connect = require('connect');
var util = require('util');
var http = require('http');
var events = require("events");
var io = require('socket.io');
var app = express.createServer();
var db = mongoose.connect(config.db);

app.configure(function () {
    app.set('views', __dirname + config.view_path);
    app.set('view engine', config.view_engine);
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
   // app.use(connectTimeout({ time: 10000 }));
    app.use(express.session({ secret: "keyboard cat" }));
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + config.public_path));
});

app.configure('development', function () {
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: false, showStack: false }));
    app.set('db-uri', config.db);
});

app.configure('production', function () {
    app.use(express.logger());
    app.use(express.errorHandler());
    app.set('db-uri', config.db);
});

app.get('/', function (req, res) {
    req.session.message = 'Hello World';
    console.log(req.session.message);
    res.render('index', {
        title: config.title,
        logo: config.logo
    });
});

app.get('/login', function (req, res) {
    console.log('request login form');
    if (req.xhr) {
        res.partial('login', {
            title: config.title,
            logo: config.logo
        });
    }
});

app.post('/login', function (req, res) {
    console.log('submit login form');
    user.save(req, function(err){
        var message = (err) ? 'User details invalid.' : 'User registered.';

        if (req.xhr) {
            res.contentType('json');
            res.send({ message:message});
        }
    });
});

app.get('/addchannel', function (req, res) {
    console.log('request add channel form');
    if (req.xhr) {
        res.partial('addchannel', {
            title: config.title,
            logo: config.logo
        });
    }
});

app.post('/addchannel', function (req, res) {
    console.log('submit add channel form');
    console.log(req.session.user);

        console.log('calling for channel: '+ req.body.add_channel_text);
        var request = channel.request(req.body.add_channel_text);

        request.addListener("response", function (response) {
            var body = "";

            response.addListener("data", function (data) {
                body += data;
            });

            //send tracks to client
            response.addListener("end", function (end) {
                var tracks = channel.parse(body);
                user.add_channel(req, res, tracks, function(err){

                    var message = (err) ? 'Channel not saved.' : 'channel saved.';
                    if (tracks.length > 0) {
                        console.log('sending tracks to client for:');
                        console.log(tracks.channel);
                        //client.emit('tracks', { items: tracks, 'channel': tracks.channel});

                        if (req.xhr) {
                            res.contentType('json');
                            res.send({ message:message});
                        }
                    }
                });
            });
        });
        request.end();
});

//app.get('/channel/:tag', function(req, res){
//  selectedChannel = req.params.tag;
//  res.render('index', {
//    title: req.params.tag,
//    logo: config.logo
//  });
//});

app.listen(config.port);
io = io.listen(app);


var parseCookie = require('connect').utils.parseCookie;

io.set('authorization', function (data, accept) {
    // check if there's a cookie header
    if (data.headers.cookie) {
        // if there is, parse the cookie
        data.cookie = parseCookie(data.headers.cookie);
        // note that you will need to use the same key to grad the
        // session id, as you specified in the Express setup.
        data.sessionID = data.cookie['express.sid'];
    } else {
       // if there isn't, turn down the connection with a message
       // and leave the function.
       return accept('No cookie transmitted.', false);
    }
    // accept the incoming connection
    accept(null, true);
});

io.sockets.on('connection', function (client) {
    //client has connected
    client.on('ready', function (message) {
        console.log('client ready to go');
        console.log(message);
    });

    //client has request channel results
    client.on('channel', function (req) {
        console.log('A socket with sessionID ' + client.handshake.sessionID + ' called!');

        //this shows how to client; passing a callback
        //io.sockets.in(channels.selected.name)
        // .emit('inChannel', channels.selected.name);

        user.exists(client.handshake.sessionID, function(me, err){
            if (err) {
                throw err;
            }
            //console.log('i exist?')
            //console.log(me);
            //var ch = me.channels[0].name;
            //console.log(me.channels.length);

           // for(ch in me.channels){
            for (var i = 0, len = me.channels.length; i < len; i++) {
                //console.log(me.channels[i].name);
                //console.log(me.channels[i].feed);
                //get channel request
                //var request = channel.request(me.channels[i].name);
                //request.addListener("response", function (response) {
                //    var body = "";

                 //   response.addListener("data", function (data) {
                 //       body += data;
                 //   });

                    //send tracks to client
                 //   response.addListener("end", function (end) {
                        //var tracks = channel.parse(body);

                    if (me.channels[i].feed.length > 0) {
                        console.log('sending tracks to client for:');
                        console.log(me.channels[i].name);
                        client.emit('tracks', { items: me.channels[i].feed, 'channel': me.channels[i].name, 'id': 'channel'+i});
                    }
             //   });
                //});
            };
        //request.end();
        });
    });

  //when a client has disconnected; i.e. closed browser
    client.on('disconnect', function () {
        console.log('Client Disconnected..');
    });
});

console.log("Express on port %d in %s mode", app.address().port, app.settings.env);
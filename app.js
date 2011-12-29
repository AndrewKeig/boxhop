var config = require('./config/config');
var channel = require('./core/channel.js');
var channel_item = require('./core/channel_item.js');
var mongoose = require('mongoose');
var user = require('./core/user');
var express = require('express');
//var connect = require('connect');
var util = require('util');
var http = require('http');
var events = require("events");
var io = require('socket.io');
var parseCookie = require('connect').utils.parseCookie;
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
    //app.use(express.logger());
    //app.use(express.errorHandler({ dumpExceptions: false, showStack: false }));
    app.set('db-uri', config.db);
});

app.configure('production', function () {
    app.use(express.logger());
    app.use(express.errorHandler());
    app.set('db-uri', config.db);
});

app.get('/', function (req, res) {
    console.log('- box hop request');
    res.render('index', { title: config.title, logo: config.logo });
});

app.get('/login', function (req, res) {
    console.log('- request login form');
    if (req.xhr) {
        console.log('- sending login form');
        res.partial('login', { title: config.title, logo: config.logo });
    }
});

app.post('/login', function (req, res) {
    console.log('- submit login form');
    user.login(req, res, function(err, message){
        message = (err) ? 'User details invalid.' : message;
        console.log('- ' + message.toLowerCase());
        if (req.xhr) {
            res.contentType('json');
            res.send({ message:message});
        }
    });
});

app.get('/addchannel', function (req, res) {
    console.log('- request add channel form for : ' + req.session.user);
    if (req.xhr) {
        if (req.session.user == null) {
            console.log('- sending login form');
            res.partial('login', { title: config.title, logo: config.logo });
        } else {
            console.log('- sending add channel form');
            res.partial('addchannel', { title: config.title, logo: config.logo });
        }
    }
});

app.post('/addchannel', function (req, res) {
    console.log('- submit add channel ' + req.body.add_channel_text + ' requested for : ' + req.session.user._id);
    var request = channel.request(req.body.add_channel_text);

    console.log('- channel requested: ' + request.query);
    request.addListener("response", function (response) {
        var body = "";

        response.addListener("data", function (data) {
            body += data;
        });

        response.addListener("end", function (end) {
            var current_channel = channel.parse(body);
            user.add_channel(req, current_channel, function(err){
                var message = (err) ? 'Channel not saved.' : 'channel saved.';
                console.log('- ' + message);
                if (current_channel.length > 0) {
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

app.listen(config.port);
io = io.listen(app);

io.set('authorization', function (data, accept) {
    console.log('- set authorisation details');
    if (data.headers.cookie) {
        data.cookie = parseCookie(data.headers.cookie);
        data.sessionID = data.cookie['express.sid'];
        console.log('- authorised as session id : ' + data.sessionID);
    } else {
       return accept('No cookie transmitted.', false);
    }
    accept(null, true);
});

io.sockets.on('connection', function (client) {
    client.on('box_hop_ready', function (message) {
        console.log('- box hop client ready to go.');
        console.log(message);
    });

    client.on('channel', function (req) {
        console.log('- handshake: ' + client.handshake);
        console.log('- a box hop client with session_id ' + client.handshake.sessionID + ' requested their channels');
        user.find_by_id(client.handshake.sessionID, function(err, me){
            if (err) {
                console.log('- fatal error; unable to find user: ' + client.handshake.sessionID);
            }
            console.log('- found user start channel sending process for: ' + me);
            for (var i = 0, len = me.channels.length; i < len; i++) {
                if (me.channels[i].feed.length > 0) {
                    console.log('- sending channel to client for: ' + me.channels[i].name);
                    //channel_item.id = i;
                    //channel_item.items = me.channels[i].feed;
                    //channel_item.channel = me.channels[i].name
                    //client.emit('add_videos_to_channel', channel_item);
                    client.emit('add_videos_to_channel', { items: me.channels[i].feed, 'channel': me.channels[i].name, 'id': i});
                }
            };
        });
    });

    client.on('disconnect', function () {
        console.log('- client has closed browser/disconnected from box hop');
    });
});

console.log("- box hop express on port %d in %s mode", app.address().port, app.settings.env);
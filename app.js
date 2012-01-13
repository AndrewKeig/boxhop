var config = require('./config/config');
var channel = require('./core/channel.js');
var channel_item = require('./core/channel_item.js');
var mongoose = require('mongoose');
var user = require('./core/user');
var express = require('express');
var util = require('util');
var http = require('http');
var events = require("events");
var io = require('socket.io');
var parseCookie = require('connect').utils.parseCookie;
var app = express.createServer();
var db = mongoose.connect(config.db);
var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore();
var Session = require('connect').middleware.session.Session;
var _ = require('underscore')._;

app.configure(function () {
    app.set('views', __dirname + config.view_path);
    app.set('view engine', config.view_engine);
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({store: sessionStore, secret: 'secret', key: 'express.sid'}));
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
            //res.contentType('json');
            //res.send({ message:message});
            res.partial('message', { title: config.title, logo: config.logo, message: message });
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

app.get('/channels', function (req, res) {
    console.log('- a box hop client with session_id ' + req.session.user.sessionId + ' requested their channels');

    if (req.xhr) {
        if (req.session.user == null) {
            console.log('- sending login form');
            res.partial('login', { title: config.title, logo: config.logo });
            return;
        }

        user.find_by_id(req.session.user.sessionId, function(err, me){
            if (err) {
                console.log('- fatal error; unable to find user: ' + req.session.user.sessionId);
                res.partial('message', { title: config.title, logo: config.logo, message: 'woops' });
            }
            else {
                console.log('- found user start channel sending process for: ' + me);
                res.partial('channels', { title: config.title, logo: config.logo, channels: me.channels });
            }
        });
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
                        //res.contentType('json');
                        //res.send({ message:message});
                        res.partial('message', { title: config.title, logo: config.logo, message: message });
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
        // save the session store to the data object
        // (as required by the Session constructor)
        data.sessionStore = sessionStore;
        sessionStore.get(data.sessionID, function (err, session) {
            if (err || !session) {
                accept('Error', false);
            } else {
                // create a session object, passing data as request and our
                // just acquired session data
                data.session = new Session(data, session);
                accept(null, true);
            }
        });
    } else {
        return accept('No cookie transmitted.', false);
    }
});

app.get('/channel/:id', function (req, res) {
    console.log(req.params.id);
    console.log('- a box hop client with session_id ' + req.session.user.sessionId + ' requested a channel:' + req.params.id);

    if (req.xhr) {
        if (req.session.user == null) {
            console.log('- sending login form');
            res.partial('login', { title: config.title, logo: config.logo });
            return;
        }

        user.find_by_id(req.session.user.sessionId, function(err, me){
            if (err) {
                console.log('- fatal error; unable to find user: ' + req.session.user.sessionId);
                res.partial('message', { title: config.title, logo: config.logo, message: 'woops' });
            }
            else {
                console.log('- found user start channel sending process for: ' + me);
                var channel = _.find(me.channels, function(channel){ return channel._id == req.params.id; });
                console.log(channel);
                res.partial('videos', { title: config.title, logo: config.logo, videos: channel.feed });
            }
        });
    }
});

io.sockets.on('connection', function (client) {
    var hs = client.handshake;
    console.log('- a socket with sessionID ' + hs.sessionID + ' connected!');
    // setup an inteval that will keep our session fresh
    var intervalID = setInterval(function () {
        // reload the session (just in case something changed,
        // we don't want to override anything, but the age)
        // reloading will also ensure we keep an up2date copy
        // of the session with our connection.
        hs.session.reload( function () {
            // "touch" it (resetting maxAge and lastAccess)
            // and save it back again.
            hs.session.touch().save();
        });
    }, 60 * 1000);

    client.on('box_hop_ready', function (message) {
        console.log('- box hop client connected and ready to go.');
        console.log(message);
    });

    client.on('channel', function (req) {
        console.log('- a box hop client with session_id ' + client.handshake.sessionID + ' requested their channel');
        user.find_by_id(client.handshake.sessionID, function(err, me){
            if (err) {
                console.log('- fatal error; unable to find user: ' + client.handshake.sessionID);
                client.emit('add_videos_to_channel', {});
                return;
            }
            else {
                console.log('- found user start channel sending process for: ' + req.id);
                console.log('- sending ' + me.channels.length + ' channels')
                for (var i = 0, len = me.channels.length; i < len; i++) {
                    if (me.channels[i].feed.length > 0 && req.id == me.channels[i]._id) {
                        console.log('- sending channel to client for: ' + me.channels[i].name);
                        client.emit('add_videos_to_channel', { items: me.channels[i].feed, 'channel': me.channels[i].name, 'id': i});
                    }
                };
            }
        });
    });

    client.on('channels', function (req) {
        console.log('- a box hop client with session_id ' + client.handshake.sessionID + ' requested their channels');
        user.find_by_id(client.handshake.sessionID, function(err, me){
            if (err) {
                console.log('- fatal error; unable to find user: ' + client.handshake.sessionID);
                client.emit('add_channels', {});
                return;
            }
            else {
                console.log('- found user start channel sending process for: ' + me);
                console.log('- sending ' + me.channels.length + ' channels')
                client.emit('add_channels', { channels: me.channels});
            }
        });
    });

    client.on('disconnect', function () {
        console.log('- client has closed browser/disconnected from box hop');
        // clear the socket interval to stop refreshing the session
        clearInterval(intervalID);
    });
});

console.log("- box hop express on port %d in %s mode", app.address().port, app.settings.env);
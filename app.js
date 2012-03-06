var channels = require('./routes/channels');
var home = require('./routes/home');
var login = require('./routes/login');
var config = require('./config/config');
var errors = require('./core/errors');
var filters = require('./core/filters');
var channel = require('./core/channel');
var logger = require('./core/logger');
var mongoose = require('mongoose');
var user = require('./core/user');
var express = require('express');
var util = require('util');
var http = require('http');
var events = require("events");
var app = express.createServer();
var db = mongoose.connect(config.db);
var mongoStore = require('connect-mongo');
var mongoSessionConfig = require('./config/mongo_config');
var sessionStore = new mongoStore(mongoSessionConfig.db);
var _ = require('underscore')._;

//var MemoryStore = express.session.MemoryStore;
//var sessionStore = new MemoryStore();
//var Session = require('connect').middleware.session.Session;


app.configure(function () {
    app.set('views', __dirname + config.view_path);
    app.set('view engine', config.view_engine);
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    //app.use(express.session({store: sessionStore, secret: 'secret', key: 'express.sid'}));
    app.use(express.session({
        secret: mongoSessionConfig.secret,
        maxAge: new Date(Date.now() + 3600000),
        store: sessionStore
    }));
    app.use(express.methodOverride());
    app.use(app.router);
});

app.configure('development', function () {
    process.env.NODE_ENV = 'development'
    //app.use(express.logger());
    //app.use(express.errorHandler({ dumpExceptions: false, showStack: false }));
    app.use(express.static(__dirname + config.public_path));
    app.set('db-uri', config.db);
});

app.configure('production', function () {
    process.env.NODE_ENV = 'production';
    app.use(express.logger());
    app.use(express.errorHandler());
    app.use(express.static(__dirname + '/public', { maxAge: 31557600000 }));
    app.set('db-uri', config.db);
});

//routes
app.get('/', home.index);
app.get('/login', logger.log, filters.IsAjaxRequest, login.show_login);
app.post('/login', filters.IsAjaxRequest, login.save_login);
app.get('/addchannel',filters.IsAjaxRequest, filters.IsUserLoggedIn, channels.show_add_channel);
app.post('/addchannel',filters.IsAjaxRequest,filters.IsUserLoggedIn, channels.save_add_channel);
app.get('/channels',filters.IsAjaxRequest,filters.IsUserLoggedIn, channels.get_channels);
app.get('/channel/:id',filters.IsAjaxRequest,filters.IsUserLoggedIn, channels.get_channel_by_id);

//errors
app.get('/404', errors.not_found);
app.get('/500', errors.internal_error);
app.error(errors.error_handler);

//process.on('uncaughtException', function (err) {
//    console.log('Caught exception: ' + err);
//});

//express listen
app.listen(config.port);

//socket.io setup
var socketIo = new require('./core/socket_handler.js')(app, sessionStore);

//run node in production
//NODE_ENV=production node server.js

console.log('- box hop express on port %d in %s mode', app.address().port, app.settings.env);
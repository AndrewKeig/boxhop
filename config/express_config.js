var config = require('../config/config');
var express = require('express');
var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore();

exports.initialise = function (app) {
    app.set('views', __dirname + config.view_path);
    app.set('view engine', config.view_engine);
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({store: sessionStore, secret: 'secret', key: 'express.sid'}));
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + config.public_path));
};

exports.development = function (app) {
    //app.use(express.logger());
    //app.use(express.errorHandler({ dumpExceptions: false, showStack: false }));
    app.set('db-uri', config.db);
};

exports.production = function (app) {
    app.use(express.logger());
    app.use(express.errorHandler());
    app.set('db-uri', config.db);
};
var config = require('../config/config');
var user = require('../core/user');
var channel = require('../core/channel.js');
var util = require('util');
var http = require('http');
var _ = require('underscore')._;

exports.show_add_channel = function (req, res) {
    console.log('- request add channel form for : ' + req.session.sessionId);
    res.partial('addchannel', { title: config.title, logo: config.logo });
};

exports.save_add_channel = function (req, res) {
    console.log('- submit add channel ' + req.body.add_channel_text + ' requested for : ' + req.session.user._id);
    var options = channel.request(req.body.add_channel_text);
    console.log('- channel requested: ' + util.inspect(options));

    var request = http.get(options, function(response){
        var data = "";
//        response.setEncoding('utf8');

        response.on('data', function(chunk){
            //console.log('- data received ' + chunk)
            data += chunk;
        });

        response.on('end', function(){
            console.log('- end received.');

            var channel_data = channel.parse(data);

            for (item in channel_data) {
                console.log(util.inspect(channel_data[item]));
            }

            user.add_channel(req, channel_data, function(err){
                var message = (err) ? 'Channel not saved.' : 'channel saved.';
                console.log('- ' + message);
                if (channel_data.length > 0) {
                    res.partial('message', { title: config.title, logo: config.logo, message: message });
                }
            });
        });

        res.on('close', function(){
            console.log('- close received.');
        });
    });

    req.on('error', function(error){
        console.log('- error: ' + error);
    });
};

exports.get_channels = function (req, res) {
    console.log('- a box hop client  requested channels with sessionId ' + req.session.user.sessionId + ' requested their channels');

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
};

exports.get_channel_by_id = function (req, res) {
    console.log('- channel requested ' + req.params.id);
    console.log('- a box hop client with sessionId ' + req.session.sessionId + ' requested a channel:' + req.params.id);

    user.find_by_id(req.session.user.sessionId, function(err, me){
        if (err) {
            console.log('- fatal error; unable to find user: ' + req.session.sessionId);
            res.partial('message', { title: config.title, logo: config.logo, message: 'woops' });
        }
        else {
            console.log('- found user start channel sending process for: ' + me);
            var channel = _.find(me.channels, function(channel){
                return channel._id == req.params.id;
            });
            console.log('- channel found: ' + channel);
            res.partial('videos', { title: config.title, logo: config.logo, videos: channel.feed });
        }
    });
};
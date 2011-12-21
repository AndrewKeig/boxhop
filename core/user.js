var User = require('../models/user.js').model('User');
var Media = require('../models/user.js').model('Media');
var Channel = require('../models/user.js').model('Channel');

exports.exists = function (id, callback) {
    User.findById(id, function(err, user) {
        console.log(user);
        console.log('authenticate');
        if (err) {
            throw err;
        }
        callback(user);
    });
}

exports.save = function (req, callback) {
    var user = new User(req.body.user);
    console.log(user);
    user.save(function (err) {
        if (err) {
            throw err;
        }
        req.session.user = user;
        callback();
    });
}

exports.add_channel = function (req, res, tracks, callback) {
    console.log('user add channel');
    User.findById(req.session.user._id, function(err, user) {

        var channel = new Channel();
        channel.name = req.body.add_channel_text;

        for (track in tracks) {
            var media = new Media();
            media.id = tracks[track].id;
            media.imageUrl = tracks[track].imageUrl;
            media.videoUrl = tracks[track].videoUrl;
            channel.feed.push(media);
        }

        user.channels.push(channel);

        user.save(function (err) {
            if (err) {
                throw err;
            }
            res.cookie('express.sid', req.session.user._id, { maxAge: 900000 });
            console.log(user);
            callback();
        });
    });
}
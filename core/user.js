var User = require('../models/user.js').model('User');
var Media = require('../models/user.js').model('Media');
var Channel = require('../models/user.js').model('Channel');

exports.find_by_id = function (id, callback) {
    console.log('- find by id: ' + id);
    User.findById(id, function(err, user) {
        if (err) {
            callback(err);
        }
        console.log('- looking for user with id :' + id + ' found user : ' + user._id);
        console.log(user);
        callback(null, user);
    });
}

exports.find_by_username = function (username, callback) {
    console.log('- find by username: ' + username);
    User.findOne({username:username}, function(err, user) {
        if (err) {
            callback(err);
        }

        if (user != null) {
          console.log('- looking for user with username :' + username + ' found user : ' + user._id);
          callback(null, user);
        }
        else {
          console.log('- looking for user with username :' + username + ' user not found');
          callback(null);
        }
    });
}


exports.login = function (req, res, callback) {
    console.log('- login user: ' + req.body.user.username);
    this.find_by_username(req.body.user.username, function(err, user) {
        if (err) {
            callback(err);
        }

        if (user == null) {
            console.log('- registering user');
            var req_user = new User(req.body.user);
            
            req_user.save(function (err) {
                console.log('- saved user details');
                if (err) {
                    callback(err);
                }
                console.log(req_user);
                req.session.user = req_user;
                res.cookie('express.sid', req_user._id, { maxAge: 900000 });
                callback(null, 'User registered');
            });
        }
        else {
            console.log('- user already registered');
            res.cookie('express.sid', user._id, { maxAge: 900000 });
            req.session.user = user;
            callback(null, 'User logged in');
        }
    });
}

exports.add_channel = function (req, feed, callback) {
    console.log('- user ' + req.session.user._id + ' would like to add channel : ' + req.body.add_channel_text);
    this.find_by_id(req.session.user._id, function(err, user) {
        if (err) {
            callback(err);
        }
        console.log('- user found, creating channel for: ' + req.body.add_channel_text);
        var new_channel = new Channel();
        new_channel.name = req.body.add_channel_text;

        console.log('- adding items to user channel');
        for (item in feed) {
            var media = new Media();
            media.id = feed[item].id;
            media.imageUrl = feed[item].imageUrl;
            media.videoUrl = feed[item].videoUrl;
            media.title = feed[item].title;
            new_channel.feed.push(media);
        }

        user.channels.push(new_channel);

        console.log('- saving channel to user');
        user.save(function (err) {
            if (err) {
                console.log('- fatal error saving channel');
            }
            callback();
        });
    });
}
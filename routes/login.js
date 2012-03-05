var config = require('../config/config');
var user = require('../core/user');

exports.show_login = function(req, res){
    console.log('- request login form');
    res.partial('login', { title: config.title, logo: config.logo });
};

exports.save_login = function(req, res){
    console.log('- submit login form');
    user.login(req, res, function(err, message){
        message = (err) ? 'User details invalid.' : message;
        console.log('- ' + message.toLowerCase());
        res.partial('message', { title: config.title, logo: config.logo, message: message });
    });
};
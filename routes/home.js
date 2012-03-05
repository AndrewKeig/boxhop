var config = require('../config/config');

exports.index = function(req, res){
    console.log('- box hop request');
    res.render('index', { title: config.title, logo: config.logo });
};
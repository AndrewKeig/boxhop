var errors = require('../core/errors.js');
var util = require('util');

exports.IsUserLoggedIn = function (req, res, next) {
    console.log('- is user logged in: ' + util.inspect(req.session));
    if (req.session.user == null || req.session.user.sessionId == undefined) {
        console.log('help --------');
        next(new errors.IsNotLoggedIn);
    }
    else {
        console.log('help2 --------');
        next();
    }
};

exports.IsAjaxRequest = function (req, res, next) {
    console.log('Is ajax request : ' + req.xhr);
    if (!req.xhr) {
        next(new errors.IsNotAjaxRequest);
    }
    else {
        next();
    }
};

//module.exports = IsAjaxRequest;
//module.exports = IsUserLoggedIn;
//module.exports.AllFilters = [IsUserLoggedIn, IsAjaxRequest];
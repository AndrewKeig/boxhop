module.exports = function SocketIo(express, session) {
    var parseCookie = require('connect').utils.parseCookie;
    var io = require('socket.io').listen(express);

    io.configure('production', function(){
        io.enable('browser client minification');  // send minified client
        io.enable('browser client etag');          // apply etag caching logic based on version number
        io.enable('browser client gzip');          // gzip the file
        io.set('log level', 1);                    // reduce logging
        io.set('transports', [                     // enable all transports (optional if you want flashsocket)
            'websocket'
            , 'flashsocket'
            , 'htmlfile'
            , 'xhr-polling'
            , 'jsonp-polling'
        ]);
    });

    io.set('authorization', function(handshakeData, ack) {
        console.log('- set authorisation details');

        if (!handshakeData.headers.cookie) {
            return ack('No cookie transmitted.', false);
        };

        var cookies = parseCookie(handshakeData.headers.cookie);
        session.get(cookies['express.sid'], function(err, sessionData) {
            handshakeData.session = sessionData || {};
            handshakeData.sessionId = cookies['express.sid']|| null;
            ack(err, err ? false : true);
        });
    });

    io.sockets.on('connection', function(client) {

        var hs = client.handshake;
        console.log('- a socket with sessionId ' + hs.sessionId + ' connected!');
        var intervalID = setInterval(function () {
            hs.session.reload( function () {
                hs.session.touch().save();
            });
        }, 60 * 1000);

        client.on('box_hop_ready', function (message) {
            console.log('- box hop client connected and ready to go.');
            console.log(message);
        });

        client.on('channel', function (req) {
            console.log('- a box hop client with sessionId ' + client.handshake.sessionId + ' requested their channel');
        });

        client.on('disconnect', function () {
            console.log('- client has closed browser/disconnected from box hop');
            clearInterval(intervalID);
        });
    });

    io.sockets.on('error', function(){ console.log(arguments); });

    return io;
};
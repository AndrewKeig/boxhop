var config = {
    db: {
        db: 'boxhop',
        host: '127.0.0.1',
        port: 27017,  // optional, default: 27017
        username: 'admin', // optional
        password: 'secret', // optional
        collection: 'sessions' // optional, default: sessions
    },
    secret: '076ee61d63aa10a125ea872411e433b9'
};


module.exports = config;
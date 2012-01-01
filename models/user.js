var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var media = new Schema({
    imageUrl     : String,
    videoUrl     : String,
    title        : String
});

var channel = new Schema({
    name     : String,
    feed     : [media]
});

var user = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    channels: [channel]
});


//user_schema.virtual('id')
//    .get(function() {
//      return this._id.toHexString();
//    });

mongoose.model('User', user);
mongoose.model('Channel', channel);
mongoose.model('Media', media);
module.exports = mongoose;
var http = require('http');
var events = require("events");

var channel = {
    name: 'youtube',
    host: 'gdata.youtube.com',
    startIndex: 1,
    maxResults: 12,
    searchTerm: '',
    request: function (ch) {
        this.searchTerm = ch;
        console.log(encodeURI(this.query()));
        var videoClient = http.createClient(80, this.host);
        return videoClient.request("GET", encodeURI(this.query()), { "host": this.host });
    },
    query: function () {
        return '/feeds/api/videos?vq=' + this.searchTerm + '&orderby=published&alt=json&rel=0&start-index=' + this.startIndex + '&max-results=' + this.maxResults;
    },
    parse: function (body) {
        var feed = [];
        var tracks = JSON.parse(body).feed.entry;
        
        feed.channel = this.searchTerm;
        if (tracks.length > 0) {
            for (track in tracks) {
                feed.push({
                    id: track,
                    imageUrl: tracks[track].media$group.media$thumbnail[0].url,
                    videoUrl: (tracks[track].media$group.media$content != undefined) ? tracks[track].media$group.media$content[0].url + '&wmode=transparent&autoplay=1' : ''
                });
            }
        }
        return feed;
    }
};

module.exports = channel;
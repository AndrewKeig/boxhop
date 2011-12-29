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
        var videoClient = http.createClient(80, this.host);
        return videoClient.request("GET", encodeURI(this.query()), { "host": this.host });
    },
    query: function () {
        return '/feeds/api/videos?vq=' + this.searchTerm + '&orderby=published&alt=json&rel=0&start-index=' + this.startIndex + '&max-results=' + this.maxResults;
    },
    parse: function (body) {
        var feed = [];
        var channel_items = JSON.parse(body).feed.entry;
        
        feed.channel = this.searchTerm;
        if (channel_items.length > 0) {
            for (item in channel_items) {
                feed.push({
                    id: item,
                    imageUrl: channel_items[item].media$group.media$thumbnail[0].url,
                    videoUrl: this.apply_attributes(channel_items[item])
                });
            }
        }
        return feed;
    },
    apply_attributes: function(item) {
        return (item.media$group.media$content != undefined) ? item.media$group.media$content[0].url + '&wmode=transparent&autoplay=1' : ''
    }
};

module.exports = channel;
var http = require('http');
var events = require("events");

var channel = {
    name: 'youtube',
    host: 'gdata.youtube.com',
    startIndex: 1,
    maxResults: 24,
    request: function (ch) {
        var query = '/feeds/api/videos?vq=' + ch + '&orderby=published&alt=json&rel=0&start-index=' + this.startIndex + '&max-results=' + this.maxResults;

        var options = {
            host: this.host,
            port: 80,
            agent: false,
            path: encodeURI(query)
        };

        return options;
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
                    videoUrl: this.apply_attributes(channel_items[item]),
                    title: channel_items[item].media$group.media$title.$t
                });
            }
        }
        return feed;
    },
    apply_attributes: function(item) {
        return (item.media$group.media$content != undefined) ? item.media$group.media$content[0].url + '&controls=0&showinfo=0&wmode=transparent&autoplay=1&rel=0' : ''
    }
};

module.exports = channel;
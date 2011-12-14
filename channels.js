var http = require('http');
var events = require("events");

var channels = {
    selected: null,

    request: function (request) {
        this.selected = this.items[0];
        //for (var item in this.items) {
        //if (request.channel === this.items[item].name) {
        //this.selected = this.items[item];
        this.selected.startIndex = 1;
        this.selected.maxResults = 12;
        this.selected.searchTerm = request.channel;
        //}
        //}

        if (this.selected === null) {
            return false;
        }
        console.log(encodeURI(this.selected.query()));
        var videoClient = http.createClient(80, this.selected.host);
        return videoClient.request("GET", encodeURI(this.selected.query()), { "host": this.selected.host });
    },
    items: [
        {
            id: 2,
            name: 'youtube',
            host: 'gdata.youtube.com',
            startIndex: 1,
            maxResults: 12,
            searchTerm: '',
            query: function () {
                return '/feeds/api/videos?vq=' + this.searchTerm + '&orderby=published&alt=json&rel=0&start-index=' + this.startIndex + '&max-results=' + this.maxResults;
            },
            parse: function (body) {
                var feed = [], tracks = JSON.parse(body).feed.entry;
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
        },
		{
		    id: 3,
		    name: 'vimeo',
		    host: 'vimeo.com',
		    startIndex: 1,
		    maxResults: 12,
		    searchTerm: '',
		    query: function () {
		        return '/tag:node.js/rss';
		    },
		    parse: function (body) {
		        var feed = [], tracks = JSON.parse(body).feed.entry;
		        if (tracks.length > 0) {
		            for (track in tracks) {
		                ///api/v2/viddler.videos.search.json?key=01171d24e48b43444556524f45b3&query=node.js
		                // feed.push({ id: track, imageUrl: tracks[track].media$group.media$thumbnail[3].url });
		            }
		        }
		        return feed;
		    }
		},
        {
            id: 1,
            name: 'blip',
            host: 'blip.tv',
            startIndex: 1,
            maxResults: 12,
            searchTerm: '',
            query: function () {
                //return 'http://blip.tv/jsconf/?skin=json&version=3&pagelen=12&page=1';
                ///return '/search/?q=jsconf&skin=json&version=3&pagelen=' + this.maxResults + '&page=' + this.startIndex;
                ///return '/search?q=' + this.searchTerm + '&skin=json&version=3&pagelen=' + this.maxResults + '&page=' + this.startIndex;
            },
            parse: function (body) {
                var feed = [], tracks = JSON.parse(body.replace(');', '').replace('blip_ws_results(', ''))[0];
                if (tracks.length > 0) {
                    for (var track in tracks) {
                        feed.push({ id: track, imageUrl: tracks[track].thumbnailUrl, videoUrl: tracks[track].thumbnailUrl });
                    }
                }
                return feed;
            }
        }
    ]
};

module.exports = channels;
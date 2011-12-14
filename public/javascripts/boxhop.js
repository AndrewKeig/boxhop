var boxhop = {
    socket: null,

    initialise: function (socket) {
        this.socket = socket;
        this.reset();
    },
    reset: function () {
        this.clear_channels();
        this.hide_add_channel();
        this.hide_channels();
        this.hide_loading();
        this.clear_add_channel();
    },
    add_channel: function () {
        var channel = $('#add_channel_text').val();
        if (channel === '') return;
        this.reset();
        this.show_loading();
        this.socket.emit('channel', { channel: channel });
    },
    addVideo: function (response) {
        $('#channels').append('<img src="' + response.items[track].imageUrl + '" width="200" height="200" class="channel_item opacity" data-val="' + response.items[track].videoUrl + '" />');
        $('#channels').cycle({ fx: 'fade', direction: 'right', timeout: 5000, speed: 500 });
        // choose your transition type, ex: fade, scrollUp, shuffle, etc...
    },
    playVideo: function (me) {
        this.reset();
        $('#video').attr('src', $(me).attr('data-val'));
    },
    show_add_channel: function () {
        $('#video_container').hide();
        $('#add_channel').show();
    },
    hide_add_channel: function () {
        $('#video_container').show();
        $('#add_channel').hide();
    },
    show_channels: function () {
        $('#channels').show();
    },
    hide_channels: function () {
        $('#channels').hide();
    },
    show_loading: function () {
        $('#loading').show();
    },
    hide_loading: function () {
        $('#loading').hide();
    },
    clear_channels: function () {
        $('#channels').html('');
    },
    clear_add_channel: function () {
        $('#add_channel_text').val('');
    },
    illuminate: function (item) {
        $(item).addClass("opacity");
    },
    unilluminate: function (item) {
        $(item).removeClass("opacity");
    }
};
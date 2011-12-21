var boxhop = {
    socket: null,
    initialise: function (socket) {
        this.socket = socket;
        this.reset();
    },
    reset: function () {
        this.hide_add_channel();
        this.hide_channels();
        this.hide_loading();
        this.clear_add_channel();
        this.hide_login();
        this.hide_video();
        this.hide_message();
        //this.clear_channels();
        //this.hide_channels();
    },
    show_login: function () {
        this.reset();
        $.ajax({
            type: 'GET',
            dataType: 'html',
            contentType: 'application/html; charset=utf-8',
            url: '/login/',
            success: function (response) {
                $("#login_container").html(response);
                $("#login_container").show();
            }
        });
    },
    login: function () {
        var post_form = $('#login_form');
        var data = post_form.serialize();
        this.show_loading();
        $.ajax({
            type: 'POST',
            data: data,
            url: '/login/',
            success: function (response) {
                boxhop.reset();
                $('#message_container').html(response.message);
                $('#message_container').show();
            }
        });
    },
    show_add_channel: function () {
        this.reset();
        $.ajax({
            type: 'GET',
            dataType: 'html',
            contentType: 'application/html; charset=utf-8',
            url: '/addchannel/',
            success: function (response) {
                $("#add_channel_container").html(response);
                $("#add_channel_container").show();
            }
        });
    },
    add_channel: function () {
        //var channel = $('#add_channel_text').val();
        //if (channel === '') return;
        var post_form = $('#addchannel_form');
        var data = post_form.serialize();
        this.reset();
        this.show_loading();
        $.ajax({
            type: 'POST',
            data: data,
            url: '/addchannel/',
            success: function (response) {
                boxhop.reset();
                $('#message_container').html(response.message);
                $('#message_container').show();
            }
        });
    },
    show_channels: function () {
        this.reset();
        this.show_loading();
        this.socket.emit('channel', { channel: 'node.js' });
    },
    addVideo: function (response) {
        var id = '#'+response.id;
        $('#channel_container').append('<span class="channel" id="' + response.id + '">');
        $('#channel_container').append('<span class="overlay">' + response.channel+ '</span>');
        for(track in response.items){
            $(id).append('<img src="' + response.items[track].imageUrl + '" width="200" height="200" class="channel_item opacity" data-val="' + response.items[track].videoUrl + '" />');
            // choose your transition type, ex: fade, scrollUp, shuffle, etc...
            $(id).cycle({ fx: 'fade', direction: 'right', timeout: 5000, speed: 500 });
        };
        $('#channel_container').append('</span>');
        $('#channel_container').show();
        //  this.reset();
    },
    playVideo: function (me) {
        this.reset();
        $('#video').attr('src', $(me).attr('data-val'));
        this.show_video();
    },
    hide_login: function () {
        $("#login_container").hide();
    },
    hide_add_channel: function () {
        $('#add_channel_container').hide();
    },
    show_video: function () {
        $('#video_container').show();
    },
    hide_video: function () {
        $('#video_container').hide();
    },
    hide_channels: function () {
        $('#channel_container').hide();
    },
    show_loading: function () {
        $('#loading').show();
    },
    hide_loading: function () {
        $('#loading').hide();
    },
    hide_message: function () {
        $('#message_container').hide();
    },
    clear_channels: function () {
        $('#channel_container').html('');
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
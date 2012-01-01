var boxhop = {
    socket: null,
    initialise: function (socket) {
        this.socket = socket;
        this.reset();
    },
    reset: function () {
        this.hide_add_channel_form();
        this.hide_channels();
        this.hide_loading();
        this.clear_add_channel_form();
        this.hide_login_form();
        this.hide_video();
        this.hide_message();
    },
    show_login_form: function () {
        this.reset();
        $.ajax({
            type: 'GET',
            dataType: 'html',
            contentType: 'application/html; charset=utf-8',
            url: '/login/',
            success: function (response) {
                $("#content_container").html(response);
                $("#content_container").show();
            }
        });
    },
    submit_login_form: function () {
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
    show_add_channel_form: function () {
        this.reset();
        $.ajax({
            type: 'GET',
            dataType: 'html',
            contentType: 'application/html; charset=utf-8',
            url: '/addchannel/',
            success: function (response) {
                $("#content_container").html(response);
                $("#content_container").show();
            }
        });
    },
    submit_add_channel_form: function () {
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
    add_videos_to_channel: function (response) {
        var channel_video_id = '#channel_' + response.id + '_video';
        var title_title_id = '#channel_' + response.id + '_title';
        $(channel_video_id).append('<div class="slides_container"></div>');

        for(track in response.items){
            var item = item + '<div class="slide"><img src="' + response.items[track].imageUrl + '" width="200" height="200" title="' + response.items[track].title  + '" data-val="' + response.items[track].videoUrl + '" />';
            var item = item + '<div class="caption"><p>' + response.items[track].title + '</p></div></div>';
            $(channel_video_id + ' .slides_container').append(item);
        };

        $(channel_video_id).slides({
            preload: true,
            pagination: false,
            generatePagination: false,
            preloadImage: '../images/loading.gif',
            play: 0,
            hoverPause: true,
            animationStart: function(current){
                $('.caption').animate({
                    bottom:-35
                },100);
            },
            animationComplete: function(current){
                $('.caption').animate({
                    bottom:0
                },200);
            },
            slidesLoaded: function() {
                $('.caption').animate({
                    bottom:0
                },200);
            }
        });

        $('#').live("click", function () { boxhop.play_video(this); });
        $('#channel_container').show();
        this.hide_loading();
    },
    play_video: function (me) {
        this.reset();
        $('#video').attr('src', $(me).attr('data-val'));
        this.show_video();
    },
    hide_login_form: function () {
        $("#content_container").hide();
    },
    hide_add_channel_form: function () {
        $('#content_container').hide();
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
    clear_add_channel_form: function () {
        $('#add_channel_text').val('');
    },
    illuminate: function (item) {
        $(item).addClass("opacity");
    },
    un_illuminate: function (item) {
        $(item).removeClass("opacity");
    },
    toggle_login_form: function (){
        if ($('#login_container').is(":visible")) {
            this.hide_login_form();
        }
        else {
            this.show_login_form();
        }
    },
    toggle_channels: function (){
        if ($('#channel_container').is(":visible")) {
            this.hide_channels();
        }
        else {
            this.show_channels();
        }
    },
    toggle_add_channel_form: function (){
        if ($('#add_channel_container').is(":visible")) {
            this.hide_add_channel_form();
        }
        else {
            this.show_add_channel_form();
        }
    }
};
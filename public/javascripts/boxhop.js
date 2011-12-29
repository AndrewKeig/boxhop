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
        //this.clear_channels();
        //this.hide_channels();
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
        for(track in response.items){
            $(channel_video_id).append('<img src="' + response.items[track].imageUrl + '" width='200' height='200' title="this is a test" data-val="' + response.items[track].videoUrl + '" />');
            //$(channel_video_id).cycle({ fx:'scrollDown', easing: 'easeInOutBack', direction: 'right', timeout: 5000, speed: 500, before: boxhop.on_before(title_title_id,response.channel) });
        };
        $(channel_video_id).slicebox({slideshow: false});

        $('.channels td img').live("click", function () { boxhop.play_video(this); });

        $('#channel_container').show();
        this.hide_loading();
    },
    on_before: function(id,channel) {
        $(id).html(channel);
        //alert(channel);
        //alert(this.src);
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
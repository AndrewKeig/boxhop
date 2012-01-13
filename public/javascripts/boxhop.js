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
        this.hide_channel_videos();
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
                $('#message_container').html(response);
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
                $('#message_container').html(response);
                $('#message_container').show();
            }
        });
    },
    show_channels: function () {
        this.reset();
        this.show_loading();
        $.ajax({
            type: 'GET',
            dataType: 'html',
            contentType: 'application/html; charset=utf-8',
            url: '/channels/',
            success: function (response) {
                $("#channel_container").html(response);
                $("#channel_container").show();
            }
        });
        this.hide_loading();
    },
    show_channel_videos: function (me) {
        var id = $(me).attr('data-val');
        this.reset();
        this.show_loading();
        $.ajax({
            type: 'GET',
            dataType: 'html',
            contentType: 'application/html; charset=utf-8',
            url: '/channel/'+id,
            success: function (response) {
                $("#channel_video_container").html(response);
                $("#channel_video_container").show();
            }
        });
        this.hide_loading();
    },
    play_video: function (me) {
        this.reset();
        $('#video').attr('src', $(me).find('img').attr('data-val'));
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
    hide_channel_videos: function () {
        $('#channel_video_container').hide();
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
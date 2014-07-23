define(function() {
    // extend underscore functionality
    _.capitalize = function(str) {
        return str[0].toUpperCase() + str.slice(1);
    };

    _.slugify = function(name) {
        return name[0].toUpperCase() + name.slice(1)
            .replace(/[-_\s]([a-z])/ig, function(all, letter) {
                return letter.toUpperCase();
            });
    };

    // self-invoke when dom ready
    (function() {
        // todo: tooltip, datetimepicker, modal
        $('.add-widget-container').html($('#add_widget').html());

        $('#profile_view_model').tooltip();
        $('#group_model_container').tooltip();
        $('.dashboard-name').tooltip();
        $('#pie_content_top').tooltip();
        $('#area_content_top').tooltip();
        $('.dashboards-group').tooltip();
        $('body').on('mouseenter', '.icon-question-sign.modal-help', function() {
            $('.icon-question-sign.modal-help').tooltip('show');
        });
        $('body').on('mouseleave', '.icon-question-sign.modal-help', function() {
            $('.icon-question-sign.modal-help').tooltip('hide');
        });

        $('.date-time-picker').datetimepicker({
            showMinute: false,
            timeFormat: 'HH:mm'
        });

        $('.scroll-key span').click(function(e) {
            var target = $(e.target);
            if (target.hasClass('scroll-top')) {
                document.body.scrollTop = 0;
            } else {
                document.body.scrollTop = $('body').height();
            }
        });

        Mousetrap.bind('a+r', function() {
            $('#add_report').modal('show');
        });
        Mousetrap.bind('a+m', function() {
            $('#add_metric').modal('show');
        });
        Mousetrap.bind('a+d', function() {
            $('#add_dimension').modal('show');
        });

        $('.keyboard-shortcuts .close').on('click', function() {
            $('.keyboard-shortcuts').hide('slow');
        });

        $('.global-error-msg .close').on('click', function() {
            $('.global-error-msg').hide();
        })
    });
});
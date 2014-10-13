define([], function() {
    _.db = {
        dimensionTypes: ['int', 'float', 'percent', 'string'],
        metricOperators: ['+', '-', '*', '/']
    };

    // extend underscore functionality
    _.capitalize = function(str) {
        return str[0].toUpperCase() + str.slice(1);
    };

    _.slugify = function(name) {
        // need fix no need to capital
        return name[0].toUpperCase() + name.slice(1)
            .replace(/[-_\s]([a-z])/ig, function(all, letter) {
                return letter.toUpperCase();
            });
    };

    _.deSlugify = function(name) {
        return name.replace(/[A-Z]/g, function(letter) {
            return '-' + letter.toLowerCase();
        })
    };

    // self-invoke when dom ready
    // Todo: clean up
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


    return {
        getUTCDateByDateAndPeriod: function(date, period) {
            var retDate;
            var dateAry = [];
            switch (period) {
                case 'second':
                    dateAry = date.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
                    retDate = Date.UTC(dateAry[1], dateAry[2] - 1, dateAry[3], dateAry[4], dateAry[5], dateAry[6]);
                    break;
                case 'minute':
                    dateAry = date.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/);
                    retDate = Date.UTC(dateAry[1], dateAry[2] - 1, dateAry[3], dateAry[4], dateAry[5]);
                    break;
                case 'hour':
                    dateAry = date.match(/(\d{4})(\d{2})(\d{2})(\d{2})/);
                    retDate = Date.UTC(dateAry[1], dateAry[2] - 1, dateAry[3], dateAry[4]);
                    break;
                default:
                    dateAry = date.match(/(\d{4})(\d{2})(\d{2})/);
                    retDate = Date.UTC(dateAry[1], dateAry[2] - 1, dateAry[3]);
            }

            return retDate;
        },
        getIntervalByPeriod: function(period) {
            var retVal;
            if (!period) period = 'day';
            switch (period) {
                case 'hour':
                    retVal = 3600 * 1000;
                    break;
                case 'day':
                    retVal = 24 * 3600 * 1000;
                    break;
                case 'week':
                    retVal = 7 * 24 * 3600 * 1000;
                    break;
                case 'month':
                    retVal = 31 * 24 * 3600 * 1000;
                    break;
            }

            return retVal;
        }
    }
})
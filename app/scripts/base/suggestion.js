define([], function() {
    var suggestion = function(params) {
        $('.suggestion-search-box', params.container).unbind('keydown').keydown(function(event) {
            if (event.keyCode == 38) {
                var current = $('.suggestion-item.active', params.container);
                if (!current.length) {
                    $('.suggestion-item', params.container).first().addClass('active');
                } else if ( !! current[0].previousSibling) {
                    $(current[0].previousSibling).addClass('active');
                    current.removeClass('active');
                } else {
                    $('.suggestion-item', params.container).last().addClass('active');
                    current.removeClass('active');
                }
                current = $('.suggestion-item.active', params.container);
                $('.suggestion-search-box', params.container).val($('input', current).attr('data-name'));

            } else if (event.keyCode == 40) {
                var current = $('.suggestion-item.active', params.container);

                if (current.length && current.next().length) {
                    current.next().addClass('active');
                    current.removeClass('active');
                } else {
                    $('.suggestion-item', params.container).first().addClass('active');
                    current.removeClass('active');
                }

                current = $('.suggestion-item.active', params.container);
                $('.suggestion-search-box', params.container).val($('input', current).attr('data-name'));

            } else if (event.keyCode == 13) {
                var box = $('.suggestion-search-box', params.container);
                var val = box.val();
                var current = _.find(params.data, function(item) {
                    return item.name.toLowerCase() == val.toLowerCase();
                });
                if (current) {
                    params.checkSuggestionCallback.call(params.scope, current);
                }
            } else {
                setTimeout(function() {
                    var val = $('.suggestion-search-box', params.container).val();
                    var data = _.filter(params.data, function(item) {
                        return item.name.toLowerCase().indexOf(val.toLowerCase()) != -1;
                    });

                    params.buildSuggestionCallback.call(params.scope, data);

                    // $('.suggestion-item', params.container).on('click', function(e) {
                    //     var target = $(this);
                    //     params.checkSuggestionCallback.call(params.scope, target);
                    //     params.container.hide();
                    // });

                    $('.suggestion-item', params.container).on('mouseover', function(e) {
                        var target = $(this);
                        $('.suggestion-item', params.container).removeClass('active');
                        target.addClass('active');
                    });
                }, 0);

            }
        });
    }
    return suggestion;
});
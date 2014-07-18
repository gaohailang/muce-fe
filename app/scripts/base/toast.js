define([], function() {
    var Toast = function(config) {
        this.context = config.context == null ? $('body') : config.context;
        this.message = config.message;
        this.time = config.time == null ? 5000 : config.time; //time of duration
        this.left = config.left;
        this.top = config.top;
        this.init();
    }
    var msgEntity;
    Toast.prototype = {
        init: function() {
            $("#toastMessage").remove();
            var msgDIV = new Array();
            msgDIV.push('<div id="toastMessage">');
            msgDIV.push('<span>' + this.message + '</span>');
            msgDIV.push('</div>');
            msgEntity = $(msgDIV.join('')).appendTo(this.context);
            // toast message styles
            var left = this.left == null ? this.context.width() / 2 - msgEntity.find('span').width() / 2 : this.left;
            var top = this.top == null ? this.context.height() / 2 - msgEntity.find('span').width() / 2 : this.top;
            msgEntity.css({
                'left': left,
                'top': top
            });
            msgEntity.addClass('toast-msg');
            msgEntity.hide();
        },
        // show fade in and fade out animate
        show: function() {
            msgEntity.fadeIn(this.time / 2);
            msgEntity.fadeOut(this.time / 2);
        }
    }

    return Toast;
});
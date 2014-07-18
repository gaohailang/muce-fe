define([], function() {
    var buildFormModal = function(modalInfo, data) {
        var modal = _.template($('#add_modal').html(), modalInfo);
        $('body').append(modal);

        var host = $('#' + modalInfo.modal_form_id);
        var tplEl = $('#form_item');
        var formItem;
        var formItemWrapper;
        _.each(data, function(item, index) {
            item.className = item.attr.name;
            switch (item.attr.type) {
                case 'textarea':
                    formItem = $('<textarea/>').attr(item.attr);
                    break;
                case 'select':
                    formItem = $('<select/>').attr(item.attr);
                    if (item.options) {
                        _.each(item.options, function(option) {
                            var data = {};
                            if (typeof option == 'string') {
                                data.value = option;
                                data.text = option;
                            } else {
                                data = option;
                            }
                            formItem.append($('<option/>').val(data.value).html(data.text));
                        });
                    }
                    break;
                case 'checkbox':
                    formItem = [];
                    item.values = item.values && item.values.length > 0 ? item.values : [];
                    _.each(item.values, function(v) {
                        item.attr.value = v.val;
                        var label = $('<label/>');
                        label.append($('<input/>').attr(item.attr));
                        label.append(v.text);

                        formItem.push(label);
                    });
                    break;
                case 'radio':
                    formItem = [];
                    item.values = item.values && item.values.length > 0 ? item.values : [];
                    _.each(item.values, function(value) {
                        item.attr.value = value;
                        var label = $('<label/>');
                        label.append($('<input/>').attr(item.attr));
                        label.append(value);

                        formItem.push(label);
                    });
                    break;
                default:
                    if (item.attr.pattern) {
                        formItem = $('<div/>');
                        formItem.append($('<input/>').attr(item.attr));
                        var tip = $('<p/>').addClass('pattern-tip text-error').html(item.attr.title);
                        formItem.append(tip);
                    } else {
                        formItem = $('<input/>').attr(item.attr);
                    }
                    break;
            }

            if (item.attr.type != 'hidden') {
                formItemWrapper = _.template(tplEl.html(), item);
                host.append(formItemWrapper);
                $('.' + item.className + ' .controls', host).append(formItem);
            } else {
                host.append(formItem);
            }
        });
    }

    return buildFormModal;
});
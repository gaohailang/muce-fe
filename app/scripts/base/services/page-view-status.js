define([], function() {

    // .pageViewStatus.isActive
    // .register(onHide ,onShow)

    angular.module('', [])
        .factory('pageViewStatus', function() {

            // onblur, onfocus

            return {
                isActive: false,

            }
        });
});
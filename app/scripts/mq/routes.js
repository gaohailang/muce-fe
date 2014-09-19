define(function() {
    return {
        'mq': {
            url: '/mq',
            abstract: true,
            views: {
                'menu@mq': {
                    templateUrl: 'templates/mq/partials/menu.html'
                },
                'dblist@mq': {
                    templateUrl: 'templates/mq/partials/dblist.html'
                },
                'editor@mq': {
                    templateUrl: 'templates/mq/editor.html',
                    controller: 'mqEditorCtrl'
                },
                '@': {
                    templateUrl: 'templates/mq/index.html',
                    controller: 'mqCtrl'
                }
            }
        },
        'mq.info': {
            url: '/tbinfo/:database/:table/:view',
            templateUrl: 'templates/mq/tbinfo.html'
        },
        'mq.example': {
            url: '/example',
            templateUrl: 'templates/mq/example.html'
        },
        'mq.history': {
            url: '/history',
            templateUrl: 'templates/mq/history.html',
            controller: 'mqHistoryCtrl'
        },
        'mq.share': {
            url: '/share',
            templateUrl: 'templates/mq/share.html',
            controller: 'mqShareCtrl'
        }
    };
})
require.config({
    baseUrl: '/scripts',
    paths: {
        'bower': '../components'
    },
    shim: {
        'highcharts': {
            'exports': 'Highcharts'
        },
        'highcharts_nodata': {
            'deps': ['highcharts'],
            'exports': 'highcharts_nodata'
        }
    }
});
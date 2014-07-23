# Muce FrontEnd
built with angular, and its ui-related components, to make us focus on biz development, and aims to expolore data visualization.

## Tip
test machine: [http://192.168.100.47:9001](http://192.168.100.47:9001) @wandoulabs onsite

旧 muce 环境搭建

```
// install grunt, matchdep, grunt-contrib-connect, grunt-connect-proxy
// grunt serve
connect: {
    options: {
        port: 9000,
        hostname: '*'
    },
    server: {
        options: {
            middleware: function(connect) {
                return [
                    require('grunt-connect-proxy/lib/utils').proxyRequest,
                    mountFolder(connect, 'app')
                ];
            },
            open: true,
            useAvailablePort: true
        },
        proxies: [{
            context: '/muce-webapp/',
            host: 'muce.corp.wandoujia.com',
            changeOrigin: true,
            headers: {
                cookie: '<your cookie from muce.copr.wandoulabs>',
                host: 'muce.corp.wandoujia.com'
            }
        }]
    }
}

grunt.registerTask('serve', [
        'configureProxies:server',
        'connect:server',
        'watch'
]);
```


## Dependencies

- angular
- ui-router
- ui-bootstrap
- ui-grid
- ui-select2
- ngDialog
- angular-validator
- highchart
- ace editor
- tdbc
- knockout (abandoned)
- codemirror (abandoned)
- jquery-ui timepicker-addon (abandoned)

## Biz Modules

- report
- dashboard
- muce query
- subscribe
- channels
- analyze

## Misc


## cleanup

- [ ] 清理掉 knockout (除了巨大的 report module, mq 依赖于 ko，两者都待重写)
- [ ] 清理掉 jquery ui, jquery-ui timepicker-addon （找一个更加轻量的 ng-style 的datetime picker）
- [ ] 清理掉 codemirror (mq 依赖 codemirror) (对比 ace, 看看业务，按需加载)
- [ ] 重新看看 vendor 模块的bower化或其他方式的管理(highchart, mousestrap, bootstrap etc)

## angularify

- [ ] more friendly bootstrap(less verbose ui def )
- [ ] more friendly form
- [x] more friendly api mapper

## Report Todo

- [ ] 加上 buzy 模块（global, btn, partial etc） 思考 loading indicator 怎么做
- [ ] 丰富 mock 数据（看看 Programtic 的方式怎么搞）
- [ ] 开始各种 transformer 了... 先对 add modal 回归下
- [ ] 把 multi-choose 移植到 metric modal 中
- [ ] report detail 的开发
- [ ] date-range 开发
- [ ] period group btn@setting 的显隐 控制
- [ ] dimension advanced 和外围的约束
- [ ] 对 formly 加上 validator 的支持
- [ ] 美化样式.... huge work!

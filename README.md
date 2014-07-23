# Muce FrontEnd
built with angular, and its ui-related components, to make us focus on biz development, and aims to expolore data visualization.

## Tip
test machine: [http://192.168.100.47:9001](http://192.168.100.47:9001) @wandoulabs onsite

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

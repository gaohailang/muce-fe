var grunt = require('grunt');
var fs = require('fs');
var _ = grunt.util._;

function renderFsMock(path) {
    return JSON.parse(fs.readFileSync('./mock/data/' + path, 'utf8'));
}

function wrapper(data) {
    return {
        "data": data,
        "msg": ""
    };
}

var jobListData = [{
    "id": 550724,
    "user": "gaohailang",
    "hql": "select col_element, count(*) from android.tb_click where p_date='20140701' and p_hourmin='1100' group by col_element",
    "output": "/muce/mq/20140823/1551665c1a8e5436ff67f6ba105f4caf",
    "status": "COMPLETED",
    "priority": "VERY_LOW",
    "sTime": 1408779100,
    "rTime": 1408784473,
    "cTime": 1408784730,
    "progress": 0,
    "reason": "",
    "heartBeat": 1408782205,
    "notification": false
}, {
    "id": 550720,
    "user": "gaohailang",
    "hql": "SELECT col_url_normalize,\n       col_module,\n       col_element,\n       count(*) AS cnt\nFROM android.tb_click\nWHERE col_vc = 5132\n  AND p_date = 20140108\n  AND (col_name = '安装'\n       OR col_name = '升级')\n  AND col_content_type = 'APP'\n  AND col_url_normalize NOT LIKE '%/my_things%'\nGROUP BY col_url_normalize,\n         col_module,\n         col_element\nORDER BY cnt DESC",
    "output": "/muce/mq/20140823/b1585a2e0ff8a85c762e6d03add40cdc",
    "status": "FAILED",
    "priority": "VERY_LOW",
    "sTime": 1408778424,
    "rTime": 1408782089,
    "cTime": 1408782089,
    "progress": 0,
    "reason": "Query returned non-zero code: 10, cause: FAILED: Error in semantic analysis: 15:9 In strict mode, if ORDER BY is specified, LIMIT must also be specified. Error encountered near token 'cnt'",
    "heartBeat": 1408778517,
    "notification": false
}, {
    "id": 550698,
    "user": "gaohailang",
    "hql": "select col_element, count(*) from android.tb_click where p_date>='20140701' and p_date<='20140731' group by col_element",
    "output": "/muce/mq/20140823/fad7696cedb77c6cd19905032ec90fe4",
    "status": "COMPLETED",
    "priority": "VERY_LOW",
    "sTime": 1408776668,
    "rTime": 1408778503,
    "cTime": 1408780699,
    "progress": 0,
    "reason": "",
    "heartBeat": 1408778517,
    "notification": false
}, {
    "id": 220558,
    "user": "gaohailang",
    "hql": "select count(*) from ops.tb_siva_uninst_winb where p_date='20131222'",
    "output": "/muce/mq/20131222/0a691fe012ba364c8f14fbb53354bc5b",
    "status": "FAILED",
    "priority": "VERY_LOW",
    "sTime": 1387691394,
    "rTime": 1387691404,
    "cTime": 1387691404,
    "progress": 0,
    "reason": "Query returned non-zero code: 10, cause: FAILED: Error in semantic analysis: Line 1:120 Table not found 'tb_siva_uninst_winb'",
    "heartBeat": 1387691404,
    "notification": false
}, {
    "id": 220552,
    "user": "gaohailang",
    "hql": "select count(*) from ops.tb_siva_uninst_android where p_date='20131222'",
    "output": "/muce/mq/20131222/618971fa7da47f3319ccb6dc171352d9",
    "status": "COMPLETED",
    "priority": "VERY_LOW",
    "sTime": 1387690839,
    "rTime": 1387690849,
    "cTime": 1387691095,
    "progress": 0,
    "reason": "",
    "heartBeat": 1387691088,
    "notification": false
}, {
    "id": 220550,
    "user": "gaohailang",
    "hql": "select count(*) from tb_siva_uninst_android where p_date='20131222'",
    "output": "/muce/mq/20131222/83ab1cd91defed47de3fc7539710c471",
    "status": "FAILED",
    "priority": "VERY_LOW",
    "sTime": 1387690812,
    "rTime": 1387690816,
    "cTime": 1387690816,
    "progress": 0,
    "reason": "Query returned non-zero code: 10, cause: FAILED: Error in semantic analysis: Line 1:120 Table not found 'tb_siva_uninst_android'",
    "heartBeat": 1387690816,
    "notification": false
}];

// Todo More Mock Helper _.dateRange, etc, incrId -> ItemList

module.exports = {
    // 'GET /api/v1/meta/groups': wrapper([{
    //     "id": 1,
    //     "name": "test_group"
    // }, {
    //     "id": 2,
    //     "name": "best_group"
    // }, {
    //     "id": 3,
    //     "name": "aest_group"
    // }, {
    //     "id": 4,
    //     "name": "测试下fsaf"
    // }]),
    // 'GET /api/v1/meta/fields': wrapper([{
    //     "id": 1,
    //     "name": "age",
    //     "type": 0
    // }, {
    //     "id": 2,
    //     "name": "test1",
    //     "type": 1
    // }, {
    //     "id": 3,
    //     "name": "test2",
    //     "type": 2
    // }]),
    // 'GET /api/v1/report/1?.*': renderFsMock('report-1-data.json'),
    // 'GET /api/v1/meta/report/.*': renderFsMock('report-1-detail.json'),

    // 'GET /api/v1/mq/job$': wrapper(jobListData),
    // 'GET /api/v1/mq/job/\d+$': function() {
    //     // RANDOM CHOICE ONE
    //     return wrapper(_.sample(jobListData));
    // },
    // 'GET /api/v1/mq/job/.*/result/size': function() {
    //     return wrapper(_.random(0, 1000));
    // },

    // 'GET /api/v1/mq/job/.*/view': wrapper("\t37\nICON\t1310876\nSUB_ACTION\t69551522\nPROGRESS\t237578\nHEADER\t612882\nLIST_ITEM\t1561642\nSCROLL_TOP\t3592997\nBACK\t730800104\nLABEL\t45375981\nPOPUP_BUTTON\t3195\nTAB\t232709119\nMENU_ITEM\t202100711\nSLIDE\t2767993\nBUTDON\t1\nSPINNER\t27428152\nTEXT_LINK\t70962098\nINPUT\t66623752\nBUTTON\t828056107\nCARD\t256287733\nPICTURE\t33726563\nBaCK\t2\n"),

    // 'GET /api/v1/mq/databases': wrapper(["account", "adnetwork", "ads", "analytics", "android", "antispam", "api", "apk_wdjcdn", "apkserver_rawlog", "app", "app_search", "appbeacon", "appn", "appwap", "audit", "b_wdjimg", "cheating", "community", "communityaction", "connection", "connection_wdj", "crawler_log", "datasystem", "default", "demo", "dn_dl", "doraemon", "dservice", "dservicea", "dservicej", "ebooks", "ep", "feed", "flvcdproxy", "friends", "fw_dl", "gaojunxiu", "hadoop", "iaslog", "imageservice", "img", "ios", "ios_channel", "ios_wandoujia", "l_wandoujia", "linkscanner_log", "mariosdk", "miniwdj", "mms", "muce", "mucedataserver", "muceserver", "musics", "musics_wandoujia", "nc_dl", "omaha", "ops", "oscar", "oscaraccess", "p3", "paysdk", "pbsapk", "pbsdl", "pbspmt", "ping", "platform", "pmt_wdjcdn", "portal_nginx_log", "proxy", "push", "pushio", "pushlog", "qhapk", "qhdl", "qhpmt", "qxgapk", "qxgdl", "qxgpmt", "rawapp", "recaccess", "roshan", "s2", "satellite", "sdydpmt", "social", "socialshare", "startpage", "static", "syncaccess", "syncv2", "test", "tiny", "tmp", "tmp_murray", "ua", "uc", "uninstall", "wallpapers", "wandou_im", "wandoujia_oem", "wdindex", "windows", "windows1x", "windows2x", "www", "xibaibai", "xsearch", "xsearchvideo"]),
    // 'GET /api/v1/mq/.*/tables': wrapper(["tb_account", "tb_accountaudit", "tb_accountpocket", "tb_ads_game_ceshi", "tb_adsandpaysdkconsume", "tb_adsandpaysdkconsumenew", "tb_app", "tb_appapk", "tb_appdownload", "tb_appkey", "tb_apppackage", "tb_bid", "tb_bidreportdaily", "tb_bidreportminuteblock", "tb_bidreporttotal", "tb_campaign", "tb_campaignbill", "tb_campaignreportdaily", "tb_campaignreporttotal", "tb_consume", "tb_consume_ads", "tb_consume_paysdk", "tb_consume_with_udidinfo", "tb_datadetailformuce", "tb_download_activation_report_daily", "tb_feed_ads_data", "tb_first_pay_time_report_daily", "tb_game_recommend_daily", "tb_game_recommend_report_daily", "tb_gamerecommreportdaily", "tb_gamereport", "tb_long_time_value_report_daily", "tb_navbidreportdaily", "tb_offlinetime", "tb_payaccount", "tb_payorder", "tb_payspambid", "tb_promotionapp", "tb_retention_report_daily", "tb_searchbidctrreportdaily", "tb_searchbidreportdaily", "tb_udid_info", "tb_wandoucoin", "tb_wdcaiconsume"]),
    // 'GET /api/v1/mq/.*/.*/schema': wrapper(["col_ip", "col_date", "col_token", "col_position", "col_udid", "col_pid", "col_tag", "col_adformat", "col_price", "col_bid", "col_mac", "col_imei", "p_date", "p_hourmin"]),
    // 'GET /api/v1/mq/.*/.*/partitions': wrapper(["p_date=20140505/p_hourmin=0000", "p_date=20140506/p_hourmin=0000", "p_date=20140507/p_hourmin=0000", "p_date=20140508/p_hourmin=0000", "p_date=20140509/p_hourmin=0000", "p_date=20140510/p_hourmin=0000", "p_date=20140511/p_hourmin=0000", "p_date=20140512/p_hourmin=0000", "p_date=20140513/p_hourmin=0000", "p_date=20140514/p_hourmin=0000", "p_date=20140515/p_hourmin=0000", "p_date=20140516/p_hourmin=0000", "p_date=20140517/p_hourmin=0000", "p_date=20140518/p_hourmin=0000", "p_date=20140519/p_hourmin=0000", "p_date=20140520/p_hourmin=0000", "p_date=20140521/p_hourmin=0000", "p_date=20140522/p_hourmin=0000", "p_date=20140523/p_hourmin=0000", "p_date=20140524/p_hourmin=0000", "p_date=20140525/p_hourmin=0000", "p_date=20140526/p_hourmin=0000", "p_date=20140527/p_hourmin=0000", "p_date=20140528/p_hourmin=0000", "p_date=20140529/p_hourmin=0000", "p_date=20140530/p_hourmin=0000", "p_date=20140531/p_hourmin=0000", "p_date=20140601/p_hourmin=0000", "p_date=20140602/p_hourmin=0000"]),
    // 'GET /api/v1/meta/reports': renderFsMock('reports.json'),

    'GET /api/v1/tool/ua/reportList': wrapper([{
        "name": "BD 日报",
        "id": 1
    }, {
        "name": "消费数据",
        "id": 2
    }, {
        "name": "用户活跃",
        "id": 3
    }]),
    'GET /api/v1/tool/ua/report/.*': wrapper({
        "id": 1,
        "dimension": [{
            "id": 1,
            "dimension_value": {
                "0": "非作弊",
                "1": "作弊用户"
            },
            "disp_name": "是否作弊"
        }, {
            "id": 2,
            "dimension_value": {
                "0": "老用户",
                "1": "新用户"
            },
            "disp_name": "新老"
        }],
        "timespan": [
            ["1440", "天"],
            ["10080", "周"],
            ["43200", "月"]
        ]
    }),
    'GET /api/v1/tool/ua/reportData/.*': wrapper({
        "tableTitle": [{
            "columnid": "metric",
            "disp_name": "指标"
        }, {
            "columnid": 1,
            "data_diff": "minus",
            "disp_name": "今日值"
        }, {
            "columnid": 2,
            "data_diff": "origin",
            "disp_name": "昨日值"
        }, {
            "columnid": 3,
            "data_diff": "origin",
            "disp_name": "上周今日值"
        }, {
            "columnid": 4,
            "data_diff": "origin",
            "disp_name": "上月今日值"
        }, {
            "columnid": 5,
            "data_diff": "ratio",
            "disp_name": "昨日变化率"
        }, {
            "columnid": 6,
            "data_diff": "ratio",
            "disp_name": "上周变化率"
        }, {
            "columnid": 7,
            "data_diff": "ratio",
            "disp_name": "上月变化率"
        }],
        "tableData": [{
            "data": [-123, 93, 103, 123, 0.1023, -0.0546, 0],
            "haschild": true,
            "isopened": true,
            "name": "fakename:13",
            "id": "13",
            "children": [{
                "data": [123, 93, 103, 123, 0.1023, 0.0546, 0],
                "haschild": true,
                "isopened": false,
                "child": [{
                    "data": [123, 93, 103, 123, 0.1023, 0.0546, 0],
                    "haschild": false,
                    "isopened": false,
                    "name": "fakename:13-4-4",
                    "id": "13##4"
                }, {
                    "data": [123, 93, 103, 123, 0.1023, 0.0546, 0],
                    "haschild": false,
                    "isopened": false,
                    "name": "fakename:13-4-44",
                    "id": "135"
                }],
                "name": "fakename:13-4",
                "id": "134"
            }, {
                "data": [123, 93, 103, 123, 0.1023, -0.0546, 0],
                "haschild": true,
                "isopened": false,
                "name": "fakename:135",
                "id": "135"
            }]
        }, {
            "data": [123, 93, 103, 123, 0.1023, 0.0546, 0],
            "haschild": true,
            "isopened": true,
            "name": "fakename:16",
            "children": [{
                "data": [123, 93, 103, 123, 0.1023, 0.0546, 0],
                "haschild": "true",
                "isopened": "false",
                "name": "fakename:164",
                "id": "164"
            }],
            "id": "16"
        }, {
            "data": [123, 93, 103, 123, 0.1023, 0.0546, 0],
            "haschild": true,
            "isopened": true,
            "name": "fakename:17",
            "children": [{
                "data": [123, 93, 103, 123, 0.1023, 0.0546, 0],
                "haschild": false,
                "isopened": false,
                "name": "fakename:174",
                "id": "174"
            }],
            "id": "17"
        }]
    }),
    'GET /api/v1/tool/ua/chartData': wrapper({
        "1##1:##2:2": {
            "data": [514677.0000, 56167.0000, 562277.0000, 56326.0000, 5974986.0000, 5127350.0000, 5158867.0000, 5709.0000],
            "name": '测试下1'
        },
        "1##1:##2:1": {
            "data": [5146747.0000, 56167.0000, 5628277.0000, 5632576.0000, 5974986.0000, 5127350.0000, 5158867.0000, 51709.0000],
            "name": '测试下2'
        },
        "date": ["20140910", "20140911", "20140912", "20140913", "20140914", "20140915", "20140916", "20140917"]
    }),
    'POST REGEX': function() {

    }
};
// ==UserScript==
// @name         Gỡ - Tắt thông báo Groups Facebook
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Hỗ trợ chặn notify groups facebook
// @author       https://github.com/trangthancb
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @match        https://www.facebook.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://github.com/trangthancb/Ads-Block-List/raw/master/hide-unsub-notify-groups-facebook.user.js
// @downloadURL  https://github.com/trangthancb/Ads-Block-List/raw/master/hide-unsub-notify-groups-facebook.user.js
// ==/UserScript==

(function() {
    'use strict';
    $(document).ready(function() {
        var body = document.documentElement.innerHTML;
        var token = /"token":"([^"]+)"/.exec(body);
        var account_id = /"ACCOUNT_ID":"([^"]+)"/.exec(body);
        if(token !== null && account_id !== null) {
            var fb_dtsg = token[1];
            var c_user = account_id[1];
            setInterval(function () { getNotify(fb_dtsg, c_user); }, 2000);
        }
    });
    function getNotify(fb_dtsg, c_user) {
        var time = Math.floor(Date.now() / 1e3);
        var lasttime = GM_getValue("time", 0);
        if(time - lasttime < 5) {
            return;
        }
        console.log(time);
        GM_setValue('time', time);
        var param = `businessUserID&cursor&length=15&__user=${c_user}&__a=1&__dyn=7AgNeS4amfxd2u6Xolg9pEbEKEW74jFwxwWwWhE98nwgUaofUvHyodEbbxW4EeU52dwJKdwmUkz82lxa2m4o6e2e1tG0HFU2Jx6q7oc8rwr8467UaU6W78jG220zUhwIUa9A3W48-cw9W0F8ry9XAy85iawnEO68pwAwhVEW5AbxS2218wf62WE9EjwtUy2KfxW683EwUw&__csr=&__req=2&__beoa=0&__pc=PHASED%3ADEFAULT&dpr=1&__rev=1001572016&__s=ucd7n3%3Abnc4bh%3Ats2v0t&__hsi=6777223978763221977-0&fb_dtsg=${fb_dtsg}&jazoest=22040&__spin_r=1001572016&__spin_b=trunk&__spin_t=${Math.floor(Date.now() / 1e3)}`;
        var url = 'https://www.facebook.com/ajax/notifications/client/get.php';
        $.ajax({
            type: "POST",
            url: url,
            //async: false,
            data: param,
            dataType: "text"
        }).done(function(data) {
            var body = JSON.parse(data.slice(9));
            $.each( body.payload.nodes, function( index, value ) {
                if(value.notif_type == 'group_post_approval_request' || value.notif_type == 'commerce_interesting_product' || value.notif_type == 'group_r2j' || value.notif_type == 'group_report_to_admin'  || value.notif_type == 'group_highlights' ) {
                    var actions = value.notif_option_sets.edges[0].node.notif_options.edges;
                    if(actions.length == 2) {
                        for (var i = 0; i < actions.length; i++) {
                            console.log(actions[i].node.server_action);
                            var server_action = actions[i].node.server_action;
                            actionNotify(fb_dtsg, c_user, server_action);
                        }
                        console.log(value.notif_type);
                    }
                }
            });
        });
    }
    function actionNotify(fb_dtsg, c_user, server_action) {
        var param = `__user=${c_user}&__a=1&__dyn=7AgNeS4amfxd2u6aJGeFxqeCwKyWzEpF4Wo8oeES2N6wAxu13wFw_x-K9wSwIK7EiwXwgUOdwJKdwVxCu4bzaxi1Zxa2m4o6e2e1tG0HFU20wIx6q7ooxu6U6O3mbx-2K6o5i78jG221yxC4EhwIUa9m4-2y48-cwzwAwlo2zgrVFXAy85i9g5Wcxy48y2i17CzEmgK7o88vwEy8iw8q1ewKG2q4U7u8BwBzUuxy0W8e8&__csr=&__req=1o&__beoa=0&__pc=PHASED%3ADEFAULT&dpr=1&__rev=1001572016&__s=s6nehq%3Aj9ixmc%3A2uq9fn&__hsi=6777218381887397201-0&fb_dtsg=${fb_dtsg}&jazoest=22155&__spin_r=1001572016&__spin_b=trunk&__spin_t=${Math.floor(Date.now() / 1e3)}&queries=%7B%22o0%22%3A%7B%22doc_id%22%3A%221420844941369152%22%2C%22query_params%22%3A%7B%22input%22%3A%7B%22action_type%22%3A%22${server_action}%22%2C%22actor_id%22%3A%22${c_user}%22%2C%22client_mutation_id%22%3A%220%22%7D%7D%7D%7D`;
        var url = 'https://www.facebook.com/api/graphqlbatch/';
        var object_id;
        $.ajax({
            type: "POST",
            url: url,
            //async: false,
            data: param,
            dataType: "text"
        }).done(function(data) {
            //console.log(data);
        });
    }
})();

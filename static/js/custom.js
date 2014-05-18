/*
custom js file
for use in find_jobs

author: mm
 */
$(document).ready(function() {
    var CookieUtil = {
        get: function(name) {
            // body...
            var cookieName = encodeURIComponent(name) + "=",
                cookieStart = document.cookie.indexOf(cookieName),
                cookieValue = null;
            if (cookieStart > -1) {
                var cookieEnd = document.cookie.indexOf(";", cookieStart);
                if (cookieEnd == -1) {
                    cookieEnd = document.cookie.length;
                }
                cookieValue = decodeURIComponent(document.cookie.substring(
                    cookieStart + cookieName.length, cookieEnd));
            }
            return cookieValue;
        },
        set: function(name, value, expires, path, domain, secure) {
            // body...
            var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);
            if (expires instanceof Date) {
                cookieText += "; expires=" + expires.toUTCString();
            }
            if (path) {
                cookieText += "; path=" + path;
            }
            if (domain) {
                cookieText += "; domain=" + domain;
            }
            if (secure) {
                cookieText += "; secure";
            }
            document.cookie = cookieText;
        },
        unset: function(name, path, domain, secure) {
            // body...
            this.set(name, "", new Date(0), path, domain, secure);
        },
        clearAll: function() {
            //clean all the cookies~~!
            var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
            if (keys) {
                for (var i = keys.length; i--;)
                    document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
            }
        }
    }

        function check_new_line(obj_article) {
            var article = obj_article.text();
            obj_article.html(article.replace(/\n/g, "<br />"));
        } // transform '\n' to '<br />'

        function delete_useless_title(obj_title) {
            obj_title.text(obj_title.text().slice(3));
        } // delete "主题：" in title

        function delete_home_list_title(obj_list) {
            obj_list.children("a").each(function(index) {
                delete_useless_title($(this).children().first());
            });
        } // look into all the list, delete "主题：" in title

        function take_email(obj_article, obj_input) {
            var article = obj_article.text();
            var pattern_email = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/g;
            var reg = new RegExp(pattern_email);
            var email = article.match(reg);
            if (email != null)
                obj_input.attr("value", email[0]);
            else
                obj_input.attr("value", "未提供");
        } // match the email and write to left board

        function take_company(obj_title, obj_input) {
            var company_list = ["百度", "阿里", "腾讯", "新浪", "去哪儿"];
            var title = obj_title.text();
            var flag_match = false;
            // console.info("%s", title);
            for (var i = 0; i < company_list.length; i++) {
                if (title.match(company_list[i]) != null) {
                    obj_input.attr("value", company_list[i]);
                    flag_match = true;
                    break;
                }
            }
            if (flag_match == false)
                obj_input.attr("value", "未提供");
        } // match the email and write to left board

        function set_timer(obj_timer) {
            function checkTime(i) {
                if (i < 10)
                    i = "0" + i;
                return i
            }
            var today = new Date();
            var h = today.getHours();
            var m = today.getMinutes();
            var s = today.getSeconds();
            // add a zero in front of numbers<10
            m = checkTime(m);
            s = checkTime(s);
            obj_timer.text(h + ":" + m + ":" + s);
            t = setTimeout(set_timer, 500, obj_timer);
        }

        function set_weather(obj_weather) {

            var show_temperature, show_word;
            var weather_info = CookieUtil.get("weather");
            console.log(weather_info);
            if (weather_info == null) {
                console.log("cookie null");
                $.getJSON('http://api.openweathermap.org/data/2.5/weather?q=beijing,china&lang=zh_cn', function(data) {
                    //处理data数据
                    var kelvin_tem = 273.15; //Temperature in Kelvin
                    var temperature = data.main.temp - kelvin_tem;
                    weather_info = temperature.toFixed(0).toString() + "&" + data.weather[0].description;
                    outDate = new Date();
                    outDate.setHours((outDate.getHours() + 1) % 24);
                    CookieUtil.set("weather", weather_info, outDate);
                    show_temperature = weather_info.slice(0, weather_info.indexOf("&"));
                    show_word = weather_info.slice(weather_info.indexOf("&") + 1);
                    obj_weather.text("今日：" + show_temperature + "°C | " + show_word);
                });
            } else {
                show_temperature = weather_info.slice(0, weather_info.indexOf("&"));
                show_word = weather_info.slice(weather_info.indexOf("&") + 1);
                obj_weather.text("今日：" + show_temperature + "°C | " + show_word);
            }
        }




    if (document.title == "Find Jobs") {

        $("#tab_intern").addClass("active");

        if ($("#page_up > a").attr("href") == "")
            $("#page_up").addClass("disabled");

        if ($("#page_down > a").attr("href") == "")
            $("#page_down").addClass("disabled");

        delete_home_list_title($("div.list-group"));
        set_timer($("p#timer"));
        set_weather($("p#weather"));
    }

    if (document.title == "Job Details") {

        $("#infoTab").click(function(event) {
            window.location.href = 'http://localhost:8888/'
        });

        var pannel_body = $("div.panel-body > p");
        var pannel_title = $("h3#article-title");

        check_new_line(pannel_body);
        take_email(pannel_body, $("input#email"));
        delete_useless_title(pannel_title);
        take_company(pannel_title, $("input#company"));
    }
});
/*
for use in index.html
 */

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
};

function delete_useless_title(obj_title) {
    obj_title.text(obj_title.text().slice(3));
} // delete "主题：" in title

function delete_home_list_title(obj_list) {
    obj_list.children("a").each(function(index) {
        delete_useless_title($(this).children().first());
    });
} // look into all the list, delete "主题：" in title

function set_timer(obj_timer) {
    function checkTime(i) {
        if (i < 10)
            i = "0" + i;
        return i;
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

function setRequest() {

}

$(document).ready(function() {
    $("#tab_intern").addClass("active");
    delete_home_list_title($("div.list-group"));
    set_timer($("p#timer"));
    set_weather($("p#weather"));

    var current_page = 1;
    $("ul.pager").click(function(event) {
        // body...
        event.preventDefault();
        console.log(event.target);
        var group_category;
        var $group = $("#article_list").children();
        current_page += 1;
        for (var i = 0; i < $group.length; i++) {
            if ($group.eq(i).hasClass("active") === true) {
                group_category = $group[i].id;
            }
        }
        console.log(current_page+", "+group_category);
        $.getJSON("/index", {category: group_category, page: current_page}, function (data) {
            // body...
            console.log(data);
        });

    });
});
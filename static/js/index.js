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
    var index = obj_title.text().indexOf("主题:");
    if (index != -1) {
        var new_title = obj_title.text().slice(3);
        obj_title.text(new_title);
    }
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

    function check_weather_cookie(data) {
        // body...
        if (data == null) {

        }
    }

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

$(document).ready(function() {
    $("#tab_intern").addClass("active");
    delete_home_list_title($("div.list-group"));
    set_timer($("p#timer"));
    set_weather($("p#weather"));

    var current_page = new Object();
    current_page.ParttimeJob = 1;
    current_page.JobInfo = 1;

    $("ul.pager").click(function(event) {
        // body...
        event.preventDefault();
        var li_id = $(event.target).parent().get(0).id,
            group_category,
            temp_page = new Object(),
            $target_list,
            $group = $("#article_list").children();
        $.extend(temp_page, current_page);

        for (var i = 0; i < $group.length; i++) {
            if ($group.eq(i).hasClass("active") === true) {
                $target_list = $group.eq(i).children().children();
                group_category = $group[i].id;
                break;
            }
        }
        if (li_id == "page_up") {
            temp_page[group_category] -= 1;
        } else if (li_id == "page_down") {
            temp_page[group_category] += 1;
        } else {
            console.log("cannot find page up/down");
            return false;
        }

        console.log(temp_page[group_category] + ", " + group_category);
        $.getJSON("/index", {
                category: group_category,
                page: temp_page[group_category]
            },
            function(data) {
                // body...
                console.log(data);
                if (data.status != "ok") {
                    console.log("failed");
                    return false;
                } else {
                    $target_list.each(function(index) {
                        // body...
                        if (index > 0) {
                            var element = data.list[index - 1],
                                url = "/article/" + element.category + "/" + element.id;
                            $(this).attr("href", url);
                            $(this).children("span").eq(0).text(element.title);
                            $(this).children("span").eq(1).text(element.time);
                        }
                    });
                    delete_home_list_title($("div.list-group"));
                    $.extend(current_page, temp_page);
                    $("#page_current>a").text(current_page[group_category]);
                }
            }).fail(function() {
            // body...
            alert("ajax failed");
        });
    });
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(event) {
        var id = $(event.target).attr("href").slice(1);
        $("#page_current>a").text(current_page[id]);
    });
});
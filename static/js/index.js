/*
for use in index.html
 */
const hour_1 = 1000 * 60 * 60;
const max_index = 15;
var current_page = new Object();
current_page.ParttimeJob = 1;
current_page.JobInfo = 1;

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

    var weather_flag;
    var weather_info = localStorage.getItem("weather");
    if (weather_info == null)
        var weather_info_list = weather_info.split("&");
    var nowDate = new Date();

    if (weather_info == null || weather_info_list[2]) {
        console.log("weather null");
        $.getJSON('http://api.openweathermap.org/data/2.5/weather?q=beijing,china&lang=zh_cn', function(data) {
            //处理data数据
            var kelvin_tem = 273.15; //Temperature in Kelvin
            var temperature = data.main.temp - kelvin_tem;
            var outDate = new Date();
            var overdue_hour = (outDate.getHours() + 1) % 24;
            weather_info = temperature.toFixed(0).toString() +
                "&" +
                data.weather[0].description +
                "&" +
                overdue_hour.toString();
            localStorage.setItem("weather", weather_info);
            weather_info_list = weather_info.split("&");
            console.log(weather_info_list);
            show_temperature = weather_info_list[0];
            show_word = weather_info_list[1];
            obj_weather.text("今日：" + show_temperature + "°C | " + show_word);
        });
    } else {
        weather_info_list = weather_info.split("&");
        console.log(weather_info_list);
        show_temperature = weather_info_list[0];
        show_word = weather_info_list[1];
        obj_weather.text("今日：" + show_temperature + "°C | " + show_word);
    }
    setTimeout(set_weather, hour_1, obj_weather);
}

function pageNumberListener() {
    // body...
    if ($("#page_current a").text() == "1") {
        $("#page_up").addClass("disabled");
    } else {
        $("#page_up").removeClass("disabled");
    }
}

function pageAjax(event) {
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
    if (group_category == "SearchResult") {
        var $show_list = $("#SearchResult a"),
            begin_index = max_index * (temp_page[group_category] - 1);
        console.log("begin_index: ", begin_index);
        $show_list.hide();
        for (var i = begin_index; i < begin_index + max_index; i++) {
            $show_list.eq(i).show();
        }
        $.extend(current_page, temp_page);
        $("#page_current>a").text(current_page[group_category]);
        pageNumberListener();

    } else {
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
                    pageNumberListener();

                }
            }).fail(function() {
            // body...
            alert("ajax failed");
        });
    }
    $('body,html').animate({
        scrollTop: 0
    }, 250);
}

function searchAjax() {
    // body...
    var keyword = $(this).prev("input").val();
    if (keyword != "") {
        console.log(keyword);
        $.getJSON("/search", {
            word: keyword
        }, function(data) {
            // body...
            console.log(data);
            if (data.status != "ok") {
                console.log("failed");
                return false;
            } else {
                if ($("#SearchResult a").length != 0) {
                    $("#SearchResult a").remove();
                }
                var list_html = "";
                for (var i = 0; i < data.list.length; i++) {
                    var a_html = '<a href="/article/' +
                        data.list[i].category +
                        '/' +
                        data.list[i].id +
                        '"' +
                        ' class="list-group-item" target="_blank">' +
                        '<span>' +
                        data.list[i].title +
                        '</span>' +
                        '<span class="post-time">' +
                        data.list[i].time +
                        '</span>' +
                        '</a>';
                    list_html += a_html;
                }
                $("#SearchResult li").after(list_html);
                $("#tab_search").show();
                $('#tab_search a[href="#SearchResult"]').tab("show");

                var $show_list = $("#SearchResult a");
                for (var i = max_index; i < $show_list.length; i++) {
                    $show_list.eq(i).hide();
                }

                delete_home_list_title($("div.list-group"));
                current_page.SearchResult = 1;
                $("#page_current>a").text(current_page[SearchResult]);
                pageNumberListener();
            }
        });
    } else {
        alert("请输入有效的关键字！");
        return false;
    }
}

$(document).ready(function() {
    $("#tab_intern").addClass("active");
    delete_home_list_title($("div.list-group"));
    set_timer($("p#timer"));
    // set_weather($("p#weather"));
    // tab点击的时候，在当前页面显示当前分类的page number
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(event) {
        var id = $(event.target).attr("href").slice(1);
        $("#page_current>a").text(current_page[id]);
        pageNumberListener();
    });

    $("#tab_search").hide();
    $("#search").click(searchAjax);

    $("ul.pager").click(pageAjax);

    pageNumberListener();
});
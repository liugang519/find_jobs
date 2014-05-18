/*
for use in post.html
 */

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

$(document).ready(function() {
    $("#infoTab").click(function(event) {
        window.location.href = 'http://localhost:8888/';
    });

    var pannel_body = $("div.panel-body > p");
    var pannel_title = $("h3#article-title");

    check_new_line(pannel_body);
    take_email(pannel_body, $("input#email"));
    delete_useless_title(pannel_title);
    take_company(pannel_title, $("input#company"));
});
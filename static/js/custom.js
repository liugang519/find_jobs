/*
custom js file
for use in find_jobs

author: mm
 */
$(document).ready(function() {

    function check_new_line(obj_article) {
        var article = obj_article.text();
        obj_article.html(article.replace(/\n/g, "<br />"));
    } // transform '\n' to '<br />'

    function delete_useless_title(obj_title) {
        obj_title.text(obj_title.text().slice(3));
    }

    function delete_home_list_title(obj_list) {
        obj_list.children().each(function() {
            /* iterate through array or object */
            delete_useless_title($(this).children().first());
        });
    }

    $('#home a').click(function(e) {
        e.preventDefault()
        $(this).tab('show')
    })
    $('#about a').click(function(e) {
        e.preventDefault()
        $(this).tab('show')
    })

    if (document.title == "Find Jobs") {
        $("#home").addClass("active");

        if ($("#page_up > a").attr("href") == "")
            $("#page_up").addClass("disabled");

        if ($("#page_down > a").attr("href") == "")
            $("#page_down").addClass("disabled");

        delete_home_list_title($("div.list-group"));
    }


    if (document.title == "Job Details") {
        check_new_line($("div.panel-body > p"));
        delete_useless_title($("h3#article-title"));
    }



});
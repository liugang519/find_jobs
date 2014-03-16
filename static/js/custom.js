/*
custom js file
for use in find_jobs

author: mm
 */
$(document).ready(function() {
    if (document.title == "Find Jobs")
        $("li#home").addClass("active");

    if ($("#page_up > a").attr("href") == "")
        $("#page_up").addClass("disabled");

    if ($("#page_down > a").attr("href") == "")
        $("#page_down").addClass("disabled");
});
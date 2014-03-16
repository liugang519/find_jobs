/*
custom js file
for use in find_jobs

author: mm
 */
$(document).ready(function() {
    if ($("ul.pager a").attr("href") == "")
        $("ul.pager > li").addClass("disabled");
});
$(document).ready(function(){
    $("div#toc").tableOfContents(".container");
});

function validate_links(){
    $('a').each(function(index,param){
        var href = $(param).attr('href');
        if (typeof href !== "undefined" && href.substring(0,1) == "#"){
            // check anchor 
            var exists = $(href);
            if (typeof exists.prop("tagName") === "undefined"){
                alert('Anchor for href "'+href+'" doesn\'t exist!');
            }
        }
        // else undefined or not an anchor
    });
    alert('Link -> Anchor Validation Complete');
}

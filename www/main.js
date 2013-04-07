
window.onload = window.onresize = function() {
    $("#time").attr("style", "border:black 1px solid;padding:1px;width:100px");
}

$(function() {
    update();
});

function update() {
    $.ajax({
        type: "POST",
        url: "indi.fcgi",
        data: "<get property='Time.Now'/>\0",
        dataType: "xml",
        success: function(xml){updateTime(xml)}
    });

    setTimeout(function(){update()}, 1000);
}

function updateTime(xml) {
    $("oneNumber", xml).each(function(i) {
        var name = $(this).attr("name");
        if (name == "JD") {
            var jd = $(this).text()
            $("#jd").html(jd);
        }
    });
}

var timestamp = "1970-00-00T00:00:00";

var propertyCallbacks = {}

$(function() {
    update();
});

function update() {
    $.ajax({
        type: "POST",
        url: "indi.fcgi",
        data: "<delta timestamp='" + timestamp + "'/>",
        dataType: "xml",
        success: function(xml){updateProperties(xml)}
    });
    setTimeout(function(){update()}, 1000);
}

function setindi(data) {
    $.ajax({
        type: "POST",
        url: "indi.fcgi",
        data: data,
        dataType: "xml"
    });
}

function updateProperties(xml) {
    timestamp = $("delta", xml).attr("timestamp");

    $("setNumberVector, defNumberVector", xml).each(function(i) {
        var property = $(this).attr("device") + "." + $(this).attr("name");

        if (property in propertyCallbacks) {
            var f = propertyCallbacks[property]($(this));
        }
    });
}

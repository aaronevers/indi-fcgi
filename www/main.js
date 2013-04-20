var timestamp = "1970-00-00T00:00:00";

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
        var device = $(this).attr("device");
        var name = $(this).attr("name");

        if (device == "Telescope") {
            if (name == "Pointing") {
                updatePointing($(this));
            }
            else if (name == "SetAltAz") {
                updateState("#azelstate", $(this));
            }
            else if (name == "SetRADec2K") {
                updateState("#radecstate", $(this));
            }
        }
    });
}

function updatePointing(xml) {
    updateState("#positionstate", xml)

    $("oneNumber", xml).each(function(i) {
        var name = $(this).attr("name");
        if (name == "Az") {
            var d = $(this).text()
            d = dec2dms(d, 3, 3)
            $("#az").html(d);
        }
        else if (name == "Alt") {
            var d = $(this).text()
            d = dec2dms(d, 3, 3)
            $("#el").html(d);
        }
        else if (name == "RA2K") {
            var d = $(this).text()
            d = dec2dms(d, 2, 3)
            $("#ra").html(d);
        }
        else if (name == "Dec2K") {
            var d = $(this).text()
            d = dec2dms(d, 3, 3)
            $("#dec").html(d);
        }
    });
}

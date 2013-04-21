var timestamp = "1970-00-00T00:00:00";

var setPropertyCallbacks = {}
var defPropertyCallbacks = {}

function update(timeout) {
    $.ajax({
        type: "POST",
        url: "indi.fcgi",
        data: "<delta timestamp='" + timestamp + "'/>",
        dataType: "xml",
        success: function(xml){updateProperties(xml)}
    });
    setTimeout(function(){update(timeout)}, timeout);
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

    var typestr = "";

    var types = ["Number", "Switch", "Light", "Text"];
    for (var t in types) {
        if (typestr.length) {
            typestr += ", "
        }
        typestr += types[t] + "Vector"
    }

    $("def" + typestr, xml).each(function(i) {
        var property = $(this).attr("device") + "." + $(this).attr("name");

        if (property in defPropertyCallbacks) {
            defPropertyCallbacks[property]($(this));
        }
    });

    $("set" + typestr, xml).each(function(i) {
        var property = $(this).attr("device") + "." + $(this).attr("name");

        if (property in setPropertyCallbacks) {
            setPropertyCallbacks[property]($(this));
        }
    });
}

function setPropertyCallback(property, callback) {
    setPropertyCallbacks[property] = callback;
}

function defPropertyCallback(property, callback) {
    defPropertyCallbacks[property] = callback;
}

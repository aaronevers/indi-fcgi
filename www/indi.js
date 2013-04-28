var timestamp = "1970-00-00T00:00:00";

var setPropertyCallbacks = {}
var defPropertyCallbacks = {}

function define(timeout) {
    $.ajax({
        type: "POST",
        url: "indi.fcgi",
        data: "<delta type='def' timestamp='" + timestamp + "'/>",
        dataType: "xml",
        success: function(xml){updateProperties(xml)}
    });
    setTimeout(function(){define(timeout)}, timeout);
}

function update(timeout) {
    $.ajax({
        type: "POST",
        url: "indi.fcgi",
        data: "<delta type='set' timestamp='" + timestamp + "'/>",
        dataType: "xml",
        success: function(xml){updateProperties(xml)}
    });
    setTimeout(function(){update(timeout)}, timeout);
}

function setindi() {
    if (arguments.length < 4 || (arguments.length % 2) != 0)
        return
    var data
    for (var i = 0; i < arguments.length; i++) {
        if (i == 0) {
            data = "<set type='" + arguments[i] + "' "
        } else if (i == 1) {
            data += "property='" + arguments[i] + "' "
        } else {
            data += arguments[i] + "='" + arguments[i+1] + "' "
            i += 1
        }
    }
    data += "/>"

    $.ajax({
        type: "POST",
        url: "indi.fcgi",
        data: data,
        dataType: "xml"
    });
}

function updateProperties(xml) {
    timestamp = $("delta", xml).attr("timestamp");
    type = $("delta", xml).attr("type");

    var typestr = "";

    var types = ["Number", "Switch", "Light", "Text"];
    for (var t in types) {
        if (typestr.length) {
            typestr += ", "
        }
        typestr += types[t] + "Vector"
    }

    $(type + typestr, xml).each(function(i) {
        var property = $(this).attr("device") + "." + $(this).attr("name");

        if (type == "def" && property in defPropertyCallbacks) {
            defPropertyCallbacks[property]($(this));
        }
        else if (type == "set" && property in setPropertyCallbacks) {
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

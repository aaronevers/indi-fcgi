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

function getindi(xml) {
    var properties = {};

    for (var i = 0; i < xml.attributes.length; i++) {
        var a = xml.attributes[i];
        properties[a.name] = a.value;
    }

    for (var c = 0; c < xml.childNodes.length; c++) {
        child = xml.childNodes[c];
        var name = $(child).attr("name");
        if (name != undefined) {
            for (var i = 0; i < child.attributes.length; i++) {
                var a = child.attributes[i];
                properties[name + "." + a.name] = a.value;
            }

            if (child.firstChild != undefined) {
                properties[name + ".value"] = jQuery.trim(child.firstChild.nodeValue);
            }
        }
    }

    return properties;
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
            defPropertyCallbacks[property](getindi(this));
        }
        else if (type == "set" && property in setPropertyCallbacks) {
            setPropertyCallbacks[property](getindi(this));
        }
    });
}

function setPropertyCallback(property, callback) {
    setPropertyCallbacks[property] = callback;
}

function defPropertyCallback(property, callback) {
    defPropertyCallbacks[property] = callback;
}

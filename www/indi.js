/**********************************************************************************
 * indi.js
 * These functions define the connection to the indi.fcgi driver and API functions
 */

/**
 * Global variables
 * These typically do not need to be edited by page scripts.
 */
var setTimestamp = "1970-00-00T00:00:00";
var setPropertyCallbacks = {}

var defTimestamp = "1970-00-00T00:00:00";
var defPropertyCallbacks = {}

/**
 * API function for updating INDI property definitions.
 * Makes an ajax call to get any INDI property definitions that have changed since the last call.
 * Each page script should call this once from their on-load function to start the update poll.
 * Timeout parameter is in miliseconds.
 * Typical timeout value is 30000 to update every thirty seconds, since definitions do not change frequently.
 * Subsquent calls happen automatically.
 */
function define(timeout) {
    $.ajax({
        type: "POST",
        url: "indi.fcgi",
        data: "<delta type='def' timestamp='" + defTimestamp + "'/>",
        dataType: "xml",
        success: function(xml){updateProperties(xml)}
    });
    setTimeout(function(){define(timeout)}, timeout);
}

/**
 * API function for updating INDI property values.
 * Makes an ajax call to get any INDI property that have changed since the last call.
 * Each page script should call this once from their on-load function to start the update poll.
 * Timeout parameter is in miliseconds.
 * Typical timeout value is 1000 to update once per second.
 * Subsquent calls happen automatically.
 */
function update(timeout) {
    $.ajax({
        type: "POST",
        type: "POST",
        url: "indi.fcgi",
        data: "<delta type='set' timestamp='" + setTimestamp + "'/>",
        dataType: "xml",
        success: function(xml){updateProperties(xml)}
    });
    setTimeout(function(){update(timeout)}, timeout);
}

/**
 * API function for setting INDI properties.
 * Makes an ajax call to indi.fcgi, which translates the POST xml into a 'new' property vector.
 * Parameters are variable.
 * The first parameter must indicate the property data type, which is either Number, Text, Switch, or Light.
 * The second parameter must indicate the INDI device and property name as a string separated by a period, e.g.: "Telescope.Position"
 * The remaining parameters must be INDI property value pairs.
 *
 * Example:
 *   setIndi("Number", "Telescope.Position", "RA", "2 31 49", "Dec", "89 15.846");
 *
 * This is sent to indi.fcgi via ajax POST as:
 *   <set type="Number" property="Telescope.Position" RA="2 31 49" Dec="89 15.846"/>
 *
 * Which is translated by indi.fcgi into valid INDI XML as:
 *   <newNumberVector device="Telescope" name="Position">
 *      <oneNumber name="RA">2 31 49</oneNumber>
 *      <oneNumber name="Dec">89 15.846</oneNumber>
 *   </newNumberVector>
 *
 */
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

    console.log(data);

    $.ajax({
        type: "POST",
        url: "indi.fcgi",
        data: data,
        dataType: "xml"
    });
}

/**
 * API function for mapping a callback function onto an INDI property update.
 * The callback function will be called via the update poll when the property changes.
 * Note that this only allows one callback per property per page.
 * Properties are specified as INDI device and property name separated by a period, e.g.: "Telescope.Position"
 * Property callbacks must be a javascript function that takes the property mapped as a javascript object parameter.
 *
 * Example:
 *   setPropertyCallback("Telescope.Focus", function(map) { updatePosition(map) });
 *
 * This calls the function updatePosition with the property "Telescope.Focus" when the telescope focus is changed.
 *
 * INDI properties are mapped to a javascript object such that top level attributes are acessed via the attribute's name.
 *   E.g, the state attribute may be accessed as: map["state"]
 * Similarly each INDI property value attribute may be accessed via the value's name, period, then attribute name.
 *   E.g. map["position.name"]
 * Finally, the INDI property value's text node data is accessed via the value's name appended with ".value".
 *   E.g. map["position.value"]
 */
function setPropertyCallback(property, callback) {
    setPropertyCallbacks[property] = callback;
}

/**
 * API function for mapping a callback function onto an INDI property definition update.
 * This works the same way as setPropertyCallbacks, except it's for property definition changes.
 */
function defPropertyCallback(property, callback) {
    defPropertyCallbacks[property] = callback;
}

/**
 * Private function for mapping an INDI property's XML element into a javascript object.
 */
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

/**
 * Private function which performs callback lookup when INDI properties are updated.
 */
function updateProperties(xml) {
    var ts = $("delta", xml).attr("timestamp");
    var type = $("delta", xml).attr("type");

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
            defTimestamp = ts;
            defPropertyCallbacks[property](getindi(this));
        }
        else if (type == "set" && property in setPropertyCallbacks) {
            setTimestamp = ts;
            setPropertyCallbacks[property](getindi(this));
        }
    });
}


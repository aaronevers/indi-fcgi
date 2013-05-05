/************************************************************************
 * status.js
 * Combinded with status.html, this demonstrates use jQueryUI
 * components with INDI 'light' properties.
 */

var tablerows = "";

/**
 * Callback function for updating the interface components from the indi.js update poll function.
 * map here will contain the INDI property values converted to a javascript object.
 */
function updateStatus(map) {
    /* Update the #statusstate div using the updateState utility function.
     */
    updateState("#statusstate", map["state"], map["message"])

    for (var key in map) {
        var k = key.split(".");
        if (k.length >= 2 && k[1] == "name") {
            updateState("#" + k[0], map[k[0] + ".value"])
        }
    }
}

/**
 * JQuery alias called when the html page DOM is available for editing.
 * Put post-html initialization here.
 */
$(function() {

    /* Associate the updatePointing callback with the "Telescope.Pointing" property.
     */
    setPropertyCallback("Telescope.Status", function(map) { updateStatus(map) });

    /* Property definition callback.
     */
    defPropertyCallback("Telescope.Status", function(map) {

        /* Create the html based on the status lights available.
         */
        tablerows = "";
        for (var key in map) {
            var k = key.split(".");
            if (k.length >= 2 && k[1] == "name") {
                tablerows += "<tr><td width='20%'><label>" + map[key]
                    + "</label></td><td width='20%'><div id='" + k[0] + "' style='"
                    + stateStyle(map[k[0] + ".value"]) + "'>" + map[k[0] + ".value"]
                    + "</div></td><td width='60%'><label>" + map[k[0] + ".label"] + "</label></td></tr>\n"
            }
        }
        $("#statustable").html(tablerows);
    });

    /**
     * Start the property update poll.
     */
    update(1000);
});

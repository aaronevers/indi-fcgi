/************************************************************************
 * status.js
 * Combinded with status.html, this demonstrates use jQueryUI
 * components with INDI 'light' properties.
 */

/**
 * JQuery alias called when the html page DOM is available for editing.
 * Put post-html initialization here.
 */
$(function() {

    /* Set properties callback.
     */
    setPropertyCallback("Telescope.Status", function(map) {

        /* Update the #statusstate div using the updateState utility function.
         */
        updateState("#statusstate", map["state"], map["message"])

        for (var key in map) {
            var k = key.split(".");
            if (k.length >= 2 && k[1] == "name") {
                updateState("#" + k[0], map[k[0] + ".value"])
            }
        }
    });

    /* Property definition callback.
     */
    defPropertyCallback("Telescope.Status", function(map) {

        /* Create the html based on the status lights available.
         */
        var tablerows = "";
        for (var key in map) {
            var k = key.split(".");
            if (k.length >= 2 && k[1] == "name") {
                tablerows += "<tr><td width='25%'><label>" + map[key]
                    + "</label></td><td width='25%' id='" + k[0] + "' style='"
                    + stateStyle(map[k[0] + ".value"]) + "'>" + map[k[0] + ".value"]
                    + "</td><td width='50%'><label>" + map[k[0] + ".label"] + "</label></td></tr>\n"
            }
        }

        $("#statustable").html(tablerows);
    });

    /* Set properties callback.
     */
    setPropertyCallback("CCDCam.FanSpeed", function(map) {

        /* Update the state div using the updateState utility function.
         */
        updateState("#fanstate", map["state"], map["message"])

        for (var key in map) {
            var k = key.split(".");
            if (k.length >= 2 && k[1] == "name") {
                updateState("#" + k[0] + "-value", map[k[0] + ".value"])
                if (map[k[0] + ".value"] == "On") {
                    $("#" + k[0]).prop('checked', true);
                }
            }
        }
    });

    /* Property definition callback.
     */
    defPropertyCallback("CCDCam.FanSpeed", function(map) {

        /* Create the html based on the status lights available.
         */
        var tablerows = "";
        for (var key in map) {
            var k = key.split(".");
            if (k.length >= 2 && k[1] == "name") {
                var checked = "";
                if (map[k[0] + ".value"] == "On") {
                    checked = " checked='checked'";
                }
                tablerows += "<tr>";
                tablerows += "<td width='25%'><input type='radio' id='" + k[0] + "' name='fanspeed'" + checked + "/><label for='" + k[0] + "'>" + k[0] + "</label></td>";
                tablerows += "<td width='25%' id='" + k[0] + "-value' style='" + stateStyle(map[k[0] + ".value"]) + "'>" + map[k[0] + ".value"] + "</td>";
                tablerows += "<td width='50%'>" + map[k[0] + ".label"] + "</td>";
                tablerows += "</tr>\n";
            }
        }

        $("#fantable").html(tablerows);

        $("#fantable :radio").click(function(e) {
            setindi('Switch', 'CCDCam.FanSpeed', $(this).attr("id"), 'On');
        });
    });

    /**
     * Start the property update poll.
     */
    update(1000);
});

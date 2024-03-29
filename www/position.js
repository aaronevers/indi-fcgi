/************************************************************************
 * position.js
 * Combinded with position.html, this demonstrates use jQueryUI
 * components with INDI properties.
 */

/**
 * Callback function for updating the interface components from the indi.js update poll function.
 * map here will contain the INDI property values converted to a javascript object.
 */
function updatePointing(map) {
    /* Update the #positionstate div using the updateState utility function.
     */
    updateState("#positionstate", map["state"], map["message"])

    var d;

    /* Update the position labels using the indi propery values.
     */
    d = map["Az.value"];
    d = dec2dms(d, 3, 3)
    $("#az").html(d);

    d = map["Alt.value"];
    d = dec2dms(d, 3, 3)
    $("#el").html(d);

    d = map["RA2K.value"];
    d = dec2dms(d, 2, 3)
    $("#ra").html(d);

    d = map["Dec2K.value"];
    d = dec2dms(d, 3, 3)
    $("#dec").html(d);
}

/**
 * JQuery alias called when the html page DOM is available for editing.
 * Put post-html initialization here.
 */
$(function() {
    /* Create a callback for updating the SetAltAz state div when the INDI property is updated.
     */
    setPropertyCallback("Telescope.SetAltAz", function(map) { updateState("#azelstate", map["state"], map["message"]); });

    /* JQueryUI syntax for declaring that #trackazel is a button.
     * Creates a callback for setting telescope Alt/Az when the button is clicked.
     */
    $("#trackazel")
        .button()
        .click(function() { setindi('Number', 'Telescope.SetAltAz', 'Alt', $("#elinput").val(), 'Az', $("#azinput").val()) });

    /* Do the same for RA/Dec
     */
    setPropertyCallback("Telescope.SetRADec2K", function(map) { updateState("#radecstate", map["state"], map["message"]); });

    $("#trackradec")
        .button()
        .click(function() { setindi('Number', 'Telescope.SetRADec2K', 'RA', $("#rainput").val(), 'Dec', $("#decinput").val()) });

    /* Associate the updatePointing callback with the "Telescope.Pointing" property.
     */
    setPropertyCallback("Telescope.Pointing", function(map) { updatePointing(map) });

    /* Create a callback for updating the stop state div when the INDI property is updated.
     */
    setPropertyCallback("Telescope.Stop", function(map) {
        updateState("#stopstate", map["state"], map["message"]);
        updateState("#stopvalue", map["Stop.value"]);
    });

    /* JQueryUI syntax for declaring that #stop is a button.
     * Creates a callback for stopping the telescope when the button is clicked.
     */
    $("#stop")
        .button()
        .click(function() { setindi('Switch', 'Telescope.Stop', 'Stop', "On") });

    /* Create a callback for updating the stop state div when the INDI property is updated.
     */
    setPropertyCallback("Telescope.Stow", function(map) {
        updateState("#stowstate", map["state"], map["message"]);
        updateState("#stowvalue", map["Go.value"]);
        $("#stow").prop('checked', (map["Go.value"] == "On")?true:false)
    });

    /* JQueryUI syntax for declaring that #stop is a button.
     * Creates a callback for stopping the telescope when the button is clicked.
     */
    $("#stow")
        .button()
        .click(function() { setindi('Switch', 'Telescope.Stow', 'Go', "On") });

    /**
     * Start the property update poll.
     */
    update(1000);
});

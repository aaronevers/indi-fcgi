/************************************************************************
 * offset.js
 * Combinded with offset.html, this demonstrates use of the jQueryUI
 * spinner component with INDI properties.
 */

/**
 * Callback function for handling set offset requests.
 */
function setOffsets(ra, dec) {
    setindi('Number', 'Telescope.Offsets', 'RA', ra, 'Dec', dec)
}

/**
 * Callback function for updating the interface components from the indi.js update poll function.
 * map here will contain the INDI property values converted to a javascript object.
 */
function updateOffsets(map) {
    /* Update the #offsetstate div using the updateState utility function.
     */
    updateState("#offsetstate", map["state"], map["message"]);

    /* Update the offset labels using the indi propery values.
     */
    $("#offsetRA").html(map["RA.value"]);
    $("#offsetDec").html(map["Dec.value"]);
}

/**
 * JQuery alias called when the html page DOM is available for editing.
 * Put post-html initialization here.
 */
$(function() {
    /* JQueryUI syntax for declaring that #offsetButton is a button.
     * Declares that the setOffsets callback should be called upon the button's click event.
     */
    $("#offsetButton")
        .button()
        .click(function() { setOffsets($("#offsetRAspinner").val(), $("#offsetDecspinner").val()) });

    /* JQueryUI syntax for declaring that #offsetRAspinner and offsetDecspinner are spin boxes.
     * Declares that the setOffsets callback should be called upon the spinner's on-spin event.
     */
    $("#offsetRAspinner").spinner()
        .on( "spin", function(event, ui) { setOffsets(ui.value, $("#offsetDecspinner").val()) });

    $("#offsetDecspinner").spinner()
        .on( "spin", function(event, ui) { setOffsets($("#offsetRAspinner").val(), ui.value) });

    /* Associate the updateOffsets callback with the "Telescope.Offsets" property.
     */
    setPropertyCallback("Telescope.Offsets", function(map) { updateOffsets(map) });

    /* Property definition callback.
     */
    defPropertyCallback("Telescope.Offsets", function(map) {
        /* Update the spinners with the min, max, and step attributes only present in the INDI definition update.
         */
        var min = map["RA.min"];
        var max = map["RA.max"];
        var step = map["RA.step"];

        if (min != max) {
            $("#offsetRAspinner").spinner({min:min,max:max});
        }

        if (step != 0) {
            $("#offsetRAspinner").spinner({step:step});
        }

        min = map["Dec.min"];
        max = map["Dec.max"];
        step = map["Dec.step"];

        if (min != max) {
            $("#offsetDecspinner").spinner({min:min,max:max});
        }

        if (step != 0) {
            $("#offsetDecspinner").spinner({step:step});
        }

        /* Update the labels.
         */
        $("#offsetRAlabel").html(map["RA.label"] + ":");
        $("#offsetDeclabel").html(map["Dec.label"] + ":");

        /* Initialize the interface components.
         */
        updateOffsets(map);
    });

    /* Start the property update poll.
     */
    update(1000);
});

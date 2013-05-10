/************************************************************************
 * focus.js
 * Combinded with focus.html, this demonstrates use of the jQueryUI
 * slider component with INDI properties.
 */

/**
 * Callback function for handling set focus requests as a UI event
 */
function setFocus(event, ui) {
    setindi('Number', 'Telescope.Focus', 'position', ui.value)
}

/**
 * Callback function for updating the interface components from the indi.js update poll function.
 * map here will contain the INDI property values converted to a javascript object.
 */
function updatePosition(map) {
    /* Update the #focusstate div using the updateState utility function.
     */
    updateState("#focusstate", map["state"], map["message"]);

    /* Update the focus label and slider values using the indi propery value.
     */
    $("#focus").html(map["position.value"]);
    $("#focusslider").slider({value:parseFloat(map["position.value"])});
}

/**
 * JQuery alias called when the html page DOM is available for editing.
 * Put post-html initialization here.
 */
$(function() {
    /* JQueryUI syntax for declaring that #focusslider is a slider.
     * Declares that the setFocus callback should be called upon the slider's 'stop' event.
     */
    $("#focusslider").slider({stop:function(event, ui) { setFocus(event, ui); }});

    /* Associate the updatePosition callback with the "Telescope.Focus" property.
     */
    setPropertyCallback("Telescope.Focus", function(map) { updatePosition(map) });

    /* Property definition callback.
     */
    defPropertyCallback("Telescope.Focus", function(map) {
        /* Update the slider with the min, max, and step attributes only present in the INDI definition update.
         */
        var min = parseInt(map["position.min"]);
        var max = parseInt(map["position.max"]);
        var step = parseInt(map["position.step"]);

        if (min != max) {
            $("#focusmin").html(min);
            $("#focusmax").html(max);
            $("#focusslider").slider({min:min,max:max});
        }

        if (step != 0) {
            $("#focusslider").slider({step:step});
        }

        /* Update the label text.
         */
        $("#focuslabel").html(map["position.label"] + ":");
    });

    /* Start the property update poll.
     */
    update(1000);
});

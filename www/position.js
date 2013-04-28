
function updatePointing(map) {
    updateState("#positionstate", map["state"], map["message"])

    var d;

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

$(function() {

    setPropertyCallback("Telescope.SetAltAz", function(map) { updateState("#azelstate", map["state"], map["message"]); });

    $("#trackazel")
        .button()
        .click(function() { setindi('Number', 'Telescope.SetAltAz', 'Alt', $("#elinput").val(), 'Az', $("#azinput").val()) });

    setPropertyCallback("Telescope.SetRADec2K", function(map) { updateState("#radecstate", map["state"], map["message"]); });

    $("#trackradec")
        .button()
        .click(function() { setindi('Number', 'Telescope.SetRADec2K', 'RA', $("#rainput").val(), 'Dec', $("#decinput").val()) });

    setPropertyCallback("Telescope.Pointing", function(map) { updatePointing(map) });
    defPropertyCallback("Telescope.Pointing", function(map) { updatePointing(map) });

    define(30000);
    update(1000);
});

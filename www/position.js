
function updatePointing(xml) {
    updateState("#positionstate", xml)

    $("oneNumber", xml).each(function(i) {
        var name = $(this).attr("name");
        if (name == "Az") {
            var d = $(this).text()
            d = dec2dms(d, 3, 3)
            $("#az").html(d);
        }
        else if (name == "Alt") {
            var d = $(this).text()
            d = dec2dms(d, 3, 3)
            $("#el").html(d);
        }
        else if (name == "RA2K") {
            var d = $(this).text()
            d = dec2dms(d, 2, 3)
            $("#ra").html(d);
        }
        else if (name == "Dec2K") {
            var d = $(this).text()
            d = dec2dms(d, 3, 3)
            $("#dec").html(d);
        }
    });
}

$(function() {

    setPropertyCallback("Telescope.SetAltAz", function(xml) { updateState("#azelstate", xml); });

    $("#trackazel")
        .button()
        .click(function() {setindi("<set type='Number' property='Telescope.SetAltAz' Alt='" + $("#elinput").val() + "' Az='" + $("#azinput").val() + "'/>")});


    setPropertyCallback("Telescope.SetRADec2K", function(xml) { updateState("#radecstate", xml); });

    $("#trackradec")
        .button()
        .click(function() {setindi("<set type='Number' property='Telescope.SetRADec2K' RA='" + $("#rainput").val() + "' Dec='" + $("#decinput").val() + "'/>")});


    setPropertyCallback("Telescope.Pointing", function(xml) { updatePointing(xml) });
    defPropertyCallback("Telescope.Pointing", function(xml) { updatePointing(xml) });

    update(1000);
});

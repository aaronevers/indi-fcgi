
function setOffsets(ra, dec) {
    setindi('Number', 'Telescope.Offsets', 'RA', ra, 'Dec', dec)
}

function updateOffsets(map) {
    updateState("#offsetstate", map["state"], map["message"]);

    $("#offsetRA").html(map["RA.value"]);
    $("#offsetDec").html(map["Dec.value"]);
}

$(function() {

    $("#offsetButton")
        .button()
        .click(function() { setOffsets($("#offsetRAspinner").val(), $("#offsetDecspinner").val()) });

    $("#offsetRAspinner").spinner()
        .on( "spin", function(event, ui) { setOffsets(ui.value, $("#offsetDecspinner").val()) });

    $("#offsetDecspinner").spinner()
        .on( "spin", function(event, ui) { setOffsets($("#offsetRAspinner").val(), ui.value) });

    setPropertyCallback("Telescope.Offsets", function(map) { updateOffsets(map) });
    defPropertyCallback("Telescope.Offsets", function(map) {

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

        $("#offsetRAlabel").html(map["RA.label"] + ":");
        $("#offsetDeclabel").html(map["Dec.label"] + ":");

        updateOffsets(map);
    });

    define(30000);
    update(1000);
});

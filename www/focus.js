
function setFocus(event, ui) {
    setindi("<set type='Number' property='Telescope.Focus' position='" + ui.value + "'/>")
}

function updatePosition(xml) {
    updateState("#focusstate", xml);

    $("oneNumber", xml).each(function(i) {
        var name = $(this).attr("name");
        if (name == "position") {
            $("#focus").html($(this).text());
            $("#focusslider").slider({value:$(this).text()});

        }
    });
}

$(function() {

    $("#focusslider").slider({stop:function(event, ui) {setFocus(event, ui);}});

    setPropertyCallback("Telescope.Focus", function(xml) { updatePosition(xml) });
    defPropertyCallback("Telescope.Focus", function(xml) {

        $("oneNumber", xml).each(function(i) {
            var name = $(this).attr("name");
            if (name == "position") {
                var min = $(this).attr("min");
                var max = $(this).attr("max");
                if (min != max) {
                    $("#focusslider").slider({min:min});
                }

                var step = $(this).attr("step");
                if (step != 0) {
                    $("#focusslider").slider({step:step});
                }
            }
        });

        updatePosition(xml);
    });

    update(1000);
});

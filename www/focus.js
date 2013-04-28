
function setFocus(event, ui) {
    setindi('Number', 'Telescope.Focus', 'position', ui.value )
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
                $("#focusmin").html(min);

                var max = $(this).attr("max");
                $("#focusmax").html(max);

                if (min != max) {
                    $("#focusslider").slider({min:min,max:max});
                }

                var step = $(this).attr("step");
                if (step != 0) {
                    $("#focusslider").slider({step:step});
                }

                $("#focuslabel").html($(this).attr("label") + ":");
            }
        });

        updatePosition(xml);
    });

    define(30000);
    update(1000);
});

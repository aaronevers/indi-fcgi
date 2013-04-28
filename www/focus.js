
function setFocus(event, ui) {
    setindi('Number', 'Telescope.Focus', 'position', ui.value)
}

function updatePosition(map) {
    updateState("#focusstate", map["state"], map["message"]);

    $("#focus").html(map["position.value"]);
    $("#focusslider").slider({value:map["position.value"]});
}

$(function() {

    $("#focusslider").slider({stop:function(event, ui) {setFocus(event, ui);}});

    setPropertyCallback("Telescope.Focus", function(map) { updatePosition(map) });
    defPropertyCallback("Telescope.Focus", function(map) {

        var min = map["position.min"];
        var max = map["position.max"];
        var step = map["position.step"];

        if (min != max) {
            $("#focusmin").html(min);
            $("#focusmax").html(max);
            $("#focusslider").slider({min:min,max:max});
        }

        if (step != 0) {
            $("#focusslider").slider({step:step});
        }

        $("#focuslabel").html(map["position.label"] + ":");

        updatePosition(map);
    });

    define(30000);
    update(1000);
});

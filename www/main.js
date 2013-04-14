
window.onload = window.onresize = function() {
    $("#position").attr("style", "border:black 1px solid;padding:1px");
}

$(function() {
    $("#trackazel, #trackradec" ).button();
    $("#trackazel").click(function() {trackazel()});
    $("#trackradec").click(function() {trackradec()});
    update();
});

function update() {
    $.ajax({
        type: "POST",
        url: "indi.fcgi",
        data: "<get property='Telescope.Pointing'/>",
        dataType: "xml",
        success: function(xml){updatePointing(xml)}
    });
    $.ajax({
        type: "POST",
        url: "indi.fcgi",
        data: "<get property='Telescope.SetAltAz'/>",
        dataType: "xml",
        success: function(xml){updateSetAzEl(xml)}
    });
    $.ajax({
        type: "POST",
        url: "indi.fcgi",
        data: "<get property='Telescope.SetRADec2K'/>",
        dataType: "xml",
        success: function(xml){updatSetRADec(xml)}
    });

    setTimeout(function(){update()}, 500);
}

function updatePointing(xml) {
    updateState("#positionstate", $("setNumberVector", xml))

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

function updateSetAzEl(xml) {
    updateState("#azelstate", $("setNumberVector", xml))
}

function updatSetRADec(xml) {
    updateState("#radecstate", $("setNumberVector", xml))
}

function trackradec() {
    var data = "<set type='Number' property='Telescope.SetRADec2K' RA='" + $("#rainput").val() + "' Dec='" + $("#decinput").val() + "'/>"
    $.ajax({
        type: "POST",
        url: "indi.fcgi",
        data: data,
        dataType: "xml"
    });
}

function trackazel() {
    var data = "<set type='Number' property='Telescope.SetAltAz' Alt='" + $("#elinput").val() + "' Az='" + $("#azinput").val() + "'/>"
    $.ajax({
        type: "POST",
        url: "indi.fcgi",
        data: data,
        dataType: "xml"
    });
}

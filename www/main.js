
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

    setTimeout(function(){update()}, 500);
}

function updatePointing(xml) {
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

function pad(n, w) {
    var s = '' + n;
    while (s.length < w) s = '0' + s;
    return s
}

function rad2deg(rad) {
    return rad*180.0/Math.PI;
}

function rad2hr(rad) {
    return rad*12.0/Math.PI;
}

function deg2rad(deg) {
    return deg*Math.PI/180.0;
}

function hr2rad(hr) {
    return hr*Math.PI/12.0;
}

function dec2dms(dec, w, p) {
    var pow = Math.pow(10, p);
    var dms = "+";
    if (dec < 0.0) dms = "-";
    dec = Math.abs(dec);
    var d = Math.floor(dec);
    dec = (dec - d) * 60.0;
    var m = Math.floor(dec);
    dec = (dec - m) * 60.0;
    var s = Math.floor(dec);
    dec = (dec - s) * pow;
    var sub = Math.round(dec);
    if (sub >= pow) { sub -= pow; s++; }
    if (s >= 60.0) { s -= 60.0; m++; }
    if (m >= 60.0) { m -= 60.0; d++; }
    return dms + pad(d, w) + " " + pad(m, 2) + " " + pad(s, 2) + "." + pad(sub, p);
}

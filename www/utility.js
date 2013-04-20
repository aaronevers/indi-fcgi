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

function updateState(blockid, xml) {
    var state = xml.attr("state")

    var style;
    var text = "#fff";
    var fontsize = "0.7em";
    var height = "height:2em";
    var start = "#999";
    var end = "#666";
    var border = "#000";
    var shadow = "#999";

    if (state == "Ok") {
        start = "#0e0";
        end = "#090";
        border = "#080";
        shadow = end;
    }
    else if (state == "Busy") {
        start = "#fe0";
        end = "#f90";
        border = "#f80";
        shadow = end;
    }
    else if (state == "Alert") {
        start = "#e00";
        end = "#900";
        border = "#800";
        shadow = end;
    }

    style = height + ";text-align:center;vertical-align:middle;padding:0.25em;font-size:" + fontsize + ";font-family:sans-serif;"
        + "border:1px solid " + border + ";background:" + end + ";color:" + text + ";text-shadow:1px 1px 1px " + shadow + ";"
        + "background-image:-moz-linear-gradient(top," + start + "," + end + ");"
        + "background-image:-webkit-gradient(linear,left top,left bottom,color-stop(0," + start + "),color-stop(1," + end + "));"
        + "-ms-filter:'progid:DXImageTransform.Microsoft.gradient(startColorStr=" + start + ", EndColorStr=" + end + ")'";

    $(blockid).attr("style", style);

    var message = xml.attr("message")

    if (message == undefined) {
        $(blockid).html(state);
    }
    else {
        $(blockid).html(state + ": " + message);
    }
}

// Checks if the page has been opened by the FRE initialiseer in serviceWorker.js
var url = window.location.href;
if (url.indexOf("?") > -1) {
    var params = url.split("?")[1].split("&");
    var paramsObj = {};
    for (var i = 0; i < params.length; i++) {
        var param = params[i].split("=");
        paramsObj[param[0]] = param[1];
    }
    if (paramsObj['fre'] == "true") {
        if (paramsObj['reason'] == "install") {
            installFre(paramsObj["resume"]);
        }
        else if (paramsObj['reason'] == "update") {
            updateFre(paramsObj["resume"]);
        }
    }
}
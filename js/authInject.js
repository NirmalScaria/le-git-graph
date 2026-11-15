var authorizationReported = false;

function authorizationSuccessCallBack(token, userName) {
    console.log("Extension got the token");
    console.log(token);
    // A second run of the page's flow re-uses the spent code and fails; keep the first result.
    if (authorizationReported) {
        return;
    }
    authorizationReported = true;
    if (token == "FAIL") {
        var event = new CustomEvent("PassToBackground", { detail: { action: "authDone", status: "FAIL" } });
        window.dispatchEvent(event);
    }
    else {
        var event = new CustomEvent("PassToBackground", { detail: { action: "authDone", status: "SUCCESS", token: token, userName: userName } });
        window.dispatchEvent(event);
    }
}

// The callback page starts its flow from window.onload, but its script is inserted
// after the load event has fired, so the handler never runs. Run it ourselves then.
(function () {
    var loadFired = document.readyState == "complete";
    var onloadAtLoad = null;
    window.addEventListener("load", function () {
        loadFired = true;
        onloadAtLoad = window.onload;
    });
    var tries = 0;
    var timer = setInterval(function () {
        if (++tries > 100) {
            clearInterval(timer);
        }
        if (loadFired && typeof window.onload == "function") {
            clearInterval(timer);
            if (window.onload !== onloadAtLoad) {
                window.onload();
            }
        }
    }, 100);
})();

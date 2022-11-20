function authorizationSuccessCallBack(token, userName) {
    console.log("Extension got the token");
    console.log(token);
    if (token == "FAIL") {
        var event = new CustomEvent("PassToBackground", { detail: { action: "authDone", status: "FAIL" } });
        window.dispatchEvent(event);
    }
    else {
        var event = new CustomEvent("PassToBackground", { detail: { action: "authDone", status: "SUCCESS", token: token, userName: userName } });
        window.dispatchEvent(event);
    }
}
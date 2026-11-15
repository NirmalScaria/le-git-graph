try {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        // authDone will be sent by the authentication callback web page.
        // This serviceWorker is used to establish connection between
        // the callback web page and new commits tab of GitHub.
        // The background page can be unloaded while the user is on the OAuth
        // screen, so no tab reference survives from startListening; broadcast
        // instead. Only the tab waiting in openAuthorization has a listener.
        if (request.action == "authDone") {
            var message = request.status == "SUCCESS"
                ? { status: "SUCCESS", value: { token: request.token, userName: request.userName } }
                : { status: "FAIL" };
            chrome.tabs.query({}, function (tabs) {
                tabs.forEach(function (tab) {
                    chrome.tabs.sendMessage(tab.id, message).catch(function () { });
                });
            });
        }
        else if (request.action == "freDone") {
            chrome.tabs.remove(sender.tab.id);
        }
    });
    chrome.runtime.onInstalled.addListener(async function (details) {
        if (details.reason == "install") {
            await chrome.tabs.create({ url: "https://www.github.com/NirmalScaria/le-git-graph/?fre=true&reason=" + details.reason });
        }
        else if (details.reason == "update") {
            // TODO: [URGENT] Remove this part with next version release.
            // Else every version update will trigger an FRE.
            // await chrome.tabs.create({ url: "https://www.github.com/NirmalScaria/le-git-graph/?fre=true&reason=" + details.reason });
        }
    });
}
catch (e) {
    console.log(e);
}

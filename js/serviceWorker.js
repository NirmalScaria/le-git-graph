try {
    var githubTab;
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        // startListening action will be sent by the GitHub commits page,
        // which is actually attempting the authentication.
        if (request.action == "startListening") {
            githubTab = sender.tab;
        }
        // authDone will be sent by the authentication callback web page.
        // This serviceWorker is used to establish connection between
        // the callback web page and new commits tab of GitHub.
        else if (request.action == "authDone") {
            if (request.status != "SUCCESS") {
                chrome.tabs.sendMessage(githubTab.id, { status: "FAIL" });
            }
            else {
                const githubToken = request.token;
                const userName = request.userName;
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(githubTab.id, { status: "SUCCESS", value: { token: githubToken, userName: userName } });
                });
            }
        }
    });
}
catch (e) {
    console.log(e);
}
try {
    self.importScripts('dependancies/firebase-app.js', 'dependancies/firebase-database.js');

    const firebaseConfig = {
        apiKey: "AIzaSyAfYmATG88Dsjhe2f-Q8YrMVW1ZRvY6azA",
        authDomain: "github-tree-graph.firebaseapp.com",
        databaseURL: "https://github-tree-graph-default-rtdb.firebaseio.com",
        projectId: "github-tree-graph",
        storageBucket: "github-tree-graph.appspot.com",
        messagingSenderId: "258623901486",
        appId: "1:258623901486:web:b41cb523dbb8ee6e9674bf",
        measurementId: "G-WN4EFGB84W"
    };
    const app = firebase.initializeApp(firebaseConfig);
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        var browserToken = request.browserToken;
        const githubTokenStream = firebase.database().ref("TokenData/" + browserToken + "/githubToken");
        chrome.tabs.sendMessage(sender.tab.id, { status: "LISTENING FOR " + "TokenData/" + browserToken + "/githubToken" });
        githubTokenStream.on('value', (snapshot) => {
            var githubToken = snapshot.val();
            if (githubToken == "FAIL") {
                chrome.tabs.sendMessage(sender.tab.id, { status: "FAIL" });
                githubTokenStream.off();
            }
            if (githubToken == null) {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(sender.tab.id, { status: "NULL" });
                });
            }
            else {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(sender.tab.id, { status: "SUCCESS", value: githubToken });
                });
                githubTokenStream.off();
            }
        })
    });
}
catch (e) {
    console.log(e);
}
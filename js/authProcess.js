console.log("Injection success");
var url = window.location.href;
var accessTokenUrl = "https://scaria.herokuapp.com/github-tree-graph-server/authorize";
console.log("url is " + url);
function removeTab() {
    chrome.tabs.getCurrent(function (tab) {
        chrome.tabs.remove(tab.id);
    });
};

if (url.match(/\?error=(.+)/)) {
    console.log("Found error in url. Removing tab.");
    removeTab();
} else {
    var urlParsed = new URL(url);
    var code = urlParsed.searchParams.get("code");
    accessTokenUrl = accessTokenUrl + "?code=" + code;

    var that = this;

    var xhr = new XMLHttpRequest();

    xhr.addEventListener('readystatechange', function (event) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var jsonResponse = JSON.parse(xhr.responseText);
                if (jsonResponse.access_token) {
                    var token = jsonResponse.access_token;
                    console.log("Setting token");
                    console.log(token);
                    window.localStorage.setItem(that.key, token);
                }
                else {
                    console.log("No token found in response");
                    removeTab();
                }
            } else {
                console.log("Request failed");
                removeTab();
            }
        }
    });
    xhr.open('GET', accessTokenUrl, true);
    xhr.withCredentials = false;
    xhr.send();
}
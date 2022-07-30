function openAuthorization() {
    var authorization_url = "https://github.com/login/oauth/authorize";
    var client_id = "91ddd618eba025e4104e";
    var randomToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    var redirect_url = "https://scaria.dev/github-tree-graph/authorize?browsertoken=" + randomToken;
    var scope = "repo";
    var url = authorization_url + "?client_id=" + client_id + "&redirect_uri=" + redirect_url + "&scope=" + scope;
    chrome.runtime.sendMessage({ action: "startListening", browserToken: randomToken });
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.status == "SUCCESS" || request.status == "FAIL") {
                console.log(request);
            }
        }
    );
    window.open(url, "oauth2_popup", "width=800,height=600");
}

// If you enabled Analytics in your project, add the Firebase SDK for Google Analytics
// import { analytics } from 'https://www.gstatic.com/firebasejs/9.9.1/firebase-analytics.js'

// Add Firebase products that you want to use
// import { database } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-database.js"
async function addAuthorizationPrompt(reason) {


    var contentView = document.getElementsByClassName("clearfix")[0];
    var branchSelectionHtml = chrome.runtime.getURL('html/authorizationPrompt.html');
    await fetch(branchSelectionHtml).then(response => response.text()).then(branchSelectionHtmlText => {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = branchSelectionHtmlText;
        var newContent = tempDiv.firstChild;
        contentView.innerHTML = "";
        var authorizationButton = newContent.getElementsByClassName("authorizationButton")[0];
        var authorizationReason = newContent.getElementsByClassName("authorizationReason")[0];
        authorizationButton.addEventListener("click", openAuthorization);
        authorizationReason.innerHTML = reason;
        contentView.appendChild(newContent);
    });
    return;
}

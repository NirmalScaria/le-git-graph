async function changeAuthorizationStatus(status) {
    var authorizationTItle = document.getElementById("authorizationTitle");
    var authorizationDescription = document.getElementById("authorizationDescription");
    var authorizationButton = document.getElementById("authorizationButton");
    if (status == "WAITING") {
        authorizationTItle.innerHTML = "Waiting for authorization";
        authorizationDescription.innerHTML = "Please complete the authorization process in the popup window.";
        authorizationButton.innerHTML = 'Waiting...';
        authorizationButton.classList.remove('btn-primary');
        authorizationButton.removeEventListener("click", openAuthorization);
    }
    if (status == "SUCCESS") {
        authorizationTItle.innerHTML = "Authorization successful";
        authorizationDescription.innerHTML = "Reload this page to see the commits.";
        authorizationButton.innerHTML = 'Reload Now';
        authorizationButton.classList.add('btn-primary');
        authorizationButton.addEventListener("click", reloadThisPage);
    }
    if (status == "FAIL") {
        authorizationTItle.innerHTML = "Authorization failed";
        authorizationDescription.innerHTML = "Please try again.";
        authorizationButton.innerHTML = 'Try Again';
        authorizationButton.classList.add('btn-primary');
        authorizationButton.addEventListener("click", openAuthorization);
    }
}

function reloadThisPage() {
    window.location.reload();
}

function openAuthorization() {
    var authorization_url = "https://github.com/login/oauth/authorize";
    var client_id = "91ddd618eba025e4104e";
    var randomToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    var redirect_url = "https://scaria.dev/github-tree-graph/authorize?browsertoken=" + randomToken;
    var scope = "repo";
    var url = authorization_url + "?client_id=" + client_id + "&redirect_uri=" + redirect_url + "&scope=" + scope;
    changeAuthorizationStatus("WAITING");
    chrome.runtime.sendMessage({ action: "startListening", browserToken: randomToken });
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.status == "SUCCESS" || request.status == "FAIL") {
                console.log(request);
                if (request.status == "SUCCESS") {
                    var githubToken = request.value;
                    changeAuthorizationStatus("SUCCESS");
                    storeLocalToken(githubToken);
                }
                else {
                    changeAuthorizationStatus("FAIL");
                }
            }
        }
    );
    window.open(url, "oauth2_popup", "width=800,height=600");
}

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

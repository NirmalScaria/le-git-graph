function openAuthorization() {
    var authorization_url = "https://github.com/login/oauth/authorize";
    var client_id = "91ddd618eba025e4104e";
    var redirect_url = "https://scaria.dev/github-tree-graph/success/";
    var scope = "repo";
    var url = authorization_url + "?client_id=" + client_id + "&redirect_uri=" + redirect_url + "&scope=" + scope;
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

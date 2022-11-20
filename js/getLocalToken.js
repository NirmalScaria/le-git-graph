function getLocalToken() {
    return localStorage.getItem('GithubOAuthToken');
}

function storeLocalToken(token) {
    localStorage.setItem('GithubOAuthToken', token);
}

function getLocalUserName() {
    return localStorage.getItem("GithubUserName");
}

function storeLocalUserName(userName) {
    localStorage.setItem("GithubUserName", userName);
}
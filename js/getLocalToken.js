function getLocalToken() {
    return localStorage.getItem('GithubOAuthToken');
}

function storeLocalToken(token) {
    localStorage.setItem('GithubOAuthToken', token);
}
// Get the user-configured commits per page, default 30
function getCommitsPerPage() {
    return new Promise(function(resolve) {
        chrome.storage.sync.get(["commitsPerPage"], function(result) {
            resolve(result.commitsPerPage || 30);
        });
    });
}

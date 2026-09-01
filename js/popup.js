document.getElementById("demoImage").onclick = function() {
    chrome.tabs.create({url: "https://github.com/NirmalScaria/le-git-graph"});
}

// Load saved commit count setting
chrome.storage.sync.get(["commitsPerPage"], function(result) {
    var select = document.getElementById("commitCount");
    if (result.commitsPerPage) {
        select.value = result.commitsPerPage;
    }
});

// Save commit count when changed
document.getElementById("commitCount").addEventListener("change", function() {
    var value = parseInt(this.value);
    chrome.storage.sync.set({ commitsPerPage: value }, function() {
        var saved = document.getElementById("savedIndicator");
        saved.style.display = "block";
        setTimeout(function() {
            saved.style.display = "none";
        }, 1500);
    });
});

// The first thing that the extension should do is add a 'commits' button.
// Everything else happens only if the user clicks on it.

// The commits button is to be added on all repositories.
// Trying to filter out github's reserved pages, like login.
var pathsToExclude = ["login", "oauth", "authorize", "settings", "notifications", "new", "organizations", "marketplace", "explore", "topics", "trending", "collections", "events", "sponsors", "features", "enterprise", "pricing", ""];

function isRepoPage() {
    var windowPath = window.location.pathname;
    var windowPathArray = windowPath.split("/").filter(Boolean);
    // A repo page has at least 2 path segments: /owner/repo
    if (windowPathArray.length < 2) return false;
    if (pathsToExclude.includes(windowPathArray[0])) return false;
    return true;
}

function tryInjectCommitsButton() {
    if (!isRepoPage()) return;
    addCommitsButton();
}

// Initial injection
tryInjectCommitsButton();

// Handle GitHub's SPA navigation (Turbo Drive)
// GitHub uses turbo:load for client-side page transitions
document.addEventListener("turbo:load", function () {
    tryInjectCommitsButton();
});

// Also handle popstate for back/forward navigation
window.addEventListener("popstate", function () {
    // Small delay to let the DOM update
    setTimeout(tryInjectCommitsButton, 100);
});

// MutationObserver to re-inject the tab when GitHub's React framework
// rebuilds the navigation DOM after initial render.
// This is the main fix for the "tab appears then disappears" bug.
var _leGitGraphObserver = null;

function startObserving() {
    if (_leGitGraphObserver) {
        _leGitGraphObserver.disconnect();
    }

    _leGitGraphObserver = new MutationObserver(function (mutations) {
        // If commits tab was removed by a DOM rebuild, re-inject it
        if (!document.getElementById('commits-tab') && isRepoPage()) {
            tryInjectCommitsButton();
        }
    });

    // Observe the repo nav area or fall back to a broader target
    var observeTarget =
        document.querySelector('nav[aria-label="Repository"]') ||
        document.querySelector('.js-repo-nav') ||
        document.querySelector('#js-repo-pjax-container') ||
        document.body;

    _leGitGraphObserver.observe(observeTarget, {
        childList: true,
        subtree: true
    });
}

startObserving();

// Re-start observing after turbo navigations since the observed node may be replaced
document.addEventListener("turbo:load", function () {
    startObserving();
});

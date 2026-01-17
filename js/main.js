// The first thing that the extension should do is add a 'commits' button.
// Everything else happens only if the user clicks on it.

// Hence every other function/service is called only if the user clicks on the button.

// The commits button is to be added on all repositories.
// Trying to filter out github's reserved pages, like login. (Veryyyy incomplete. Github has many more URLs.)

var pathsToExclude = ["login", "oauth", "authorize"];
var windowUrlLink = window.location.href;
var windowUrl = new URL(windowUrlLink);
var windowPath = windowUrl.pathname;
var windowPathArray = windowPath.split("/");

if (pathsToExclude.includes(windowPathArray[1]) == false) {
    // Wait for navigation bar to be ready before adding button
    function tryAddCommitsButton() {
        var navBar = document.querySelector('nav[aria-label="Repository"] ul[role="list"]') ||
                     document.querySelector('ul[class*="UnderlineItemList"]');
        if (navBar) {
            addCommitsButton();
        }
    }

    // Initial load timing - wait for DOM and next browser paint
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            requestAnimationFrame(function() {
                setTimeout(tryAddCommitsButton, 200);
            });
        });
    } else {
        requestAnimationFrame(function() {
            setTimeout(tryAddCommitsButton, 200);
        });
    }

    // Re-add tab on Turbo navigation (GitHub's dynamic page loading)
    document.addEventListener('turbo:load', function() {
        setTimeout(addCommitsButton, 100);
    });

    document.addEventListener('turbo:render', function() {
        setTimeout(addCommitsButton, 100);
    });

    document.addEventListener('turbo:frame-load', function() {
        setTimeout(addCommitsButton, 100);
    });

    // Re-add tab if removed by DOM changes
    var observer = new MutationObserver(function(mutations) {
        if (!document.getElementById('commits-tab')) {
            addCommitsButton();
        }
    });

    setTimeout(function() {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }, 1000);
}
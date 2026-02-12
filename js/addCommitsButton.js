var isCommitsTabOpen = false;
function addCommitsButton() {
    // Prevent duplicate tabs
    if (document.getElementById('commits-tab')) {
        return;
    }

    // Find the navigation bar with fallback selectors
    var parentObject = null;
    var selectors = [
        'nav[aria-label="Repository"] ul',      // Current GitHub (2026+)
        'ul[class*="UnderlineItemList"]',        // CSS Modules fallback
        'nav[class*="LocalNavigation"] ul',      // LocalNavigation fallback
    ];

    for (var i = 0; i < selectors.length; i++) {
        var element = document.querySelector(selectors[i]);
        if (element) {
            parentObject = element;
            break;
        }
    }

    if (!parentObject) {
        return;
    }

    // Need at least one tab to clone from
    if (parentObject.children.length === 0) {
        return;
    }

    // Clone an existing tab to match GitHub's UI styling
    var sourceTabIndex = -1;
    for (var j = 0; j < parentObject.children.length; j++) {
        var child = parentObject.children[j];
        if (child && child.children && child.children[0]) {
            sourceTabIndex = j;
            // Prefer Issues tab if available
            var linkElement = child.children[0];
            if (linkElement.textContent && linkElement.textContent.toLowerCase().includes('issue')) {
                break;
            }
        }
    }

    if (sourceTabIndex === -1 || !parentObject.children[sourceTabIndex]) {
        return;
    }

    var newButton = parentObject.children[sourceTabIndex].cloneNode(true);
    var newButtonChild = newButton.children[0];

    if (!newButtonChild) {
        return;
    }

    // Build the current repo path for data-selected-links
    var pathParts = window.location.pathname.split("/").filter(Boolean);
    var repoPath = pathParts.length >= 2 ? "/" + pathParts[0] + "/" + pathParts[1] : "";

    // Configure the new Commits tab
    newButtonChild.id = "commits-tab";
    newButtonChild.setAttribute("data-tab-item", "commits-tab");
    newButtonChild.removeAttribute("aria-current");
    newButtonChild.classList.remove("selected");
    newButtonChild.setAttribute("data-selected-links", "repo_commits " + repoPath + "/commits");
    newButtonChild.removeAttribute("href");
    newButtonChild.style.cursor = "pointer";
    newButtonChild.addEventListener("click", openCommitsTab);

    // Add click handler to other tabs to close Commits view
    Array.from(parentObject.children).forEach((child) => {
        if (child.children[0]) {
            child.children[0].addEventListener("click", closeCommitsTab);
        }
    });

    // Update icon - use a git-commit style SVG icon
    // GitHub tab structure: <a> > <span data-component="icon"> > <svg> > <path>...
    try {
        var iconSpan = newButtonChild.querySelector('[data-component="icon"]') || newButtonChild.children[0];
        if (iconSpan) {
            var svg = iconSpan.querySelector('svg');
            if (svg) {
                // Replace the SVG content with a git-commit icon (from Octicons)
                svg.setAttribute("viewBox", "0 0 16 16");
                svg.innerHTML = '<path fill-rule="evenodd" d="M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.75a4.002 4.002 0 01-7.86 0H.75a.75.75 0 110-1.5h3.32a4.001 4.001 0 017.86 0h3.32a.75.75 0 110 1.5h-3.32z"></path>';
            }
        }
    } catch (e) {
        // Icon update failed, continue with default
    }

    // Update label
    try {
        var textSpan = newButtonChild.querySelector('[data-component="text"]') || newButtonChild.children[1];
        if (textSpan) {
            textSpan.setAttribute("data-content", "Commits");
            textSpan.innerText = "Commits";
        }
    } catch (e) {
        // Label update failed, continue
    }

    // Remove count indicator (e.g., "Issues 22")
    try {
        var counterSpan = newButtonChild.querySelector('[data-component="counter"]');
        if (counterSpan) {
            counterSpan.remove();
        } else if (newButtonChild.children[2]) {
            newButtonChild.removeChild(newButtonChild.children[2]);
        }
    } catch (e) {
        // No counter to remove
    }

    // Insert the Commits tab after Code (position 1)
    try {
        var insertPosition = parentObject.children[1] || parentObject.children[0];
        if (insertPosition) {
            parentObject.insertBefore(newButton, insertPosition);
        } else {
            parentObject.appendChild(newButton);
        }
    } catch (e) {
        return;
    }

    function closeCommitsTab() {
        isCommitsTabOpen = false;
        var commitsTabButton = document.getElementById("commits-tab");
        if (commitsTabButton) {
            commitsTabButton.addEventListener("click", openCommitsTab);
            commitsTabButton.removeAttribute("aria-current");
        }
    }
}

var isCommitsTabOpen = false;

function addCommitsButton() {
    // Prevent duplicate tabs
    if (document.getElementById('commits-tab')) {
        return;
    }

    // Find the navigation bar with fallback selectors
    var parentObject = null;
    var selectors = [
        'nav[aria-label="Repository"] ul',                    // Current GitHub (2026+)
        'ul[class*="UnderlineItemList"]',                     // CSS Modules fallback
        'nav[class*="LocalNavigation"] ul',                   // LocalNavigation fallback
    ];

    for (var i = 0; i < selectors.length; i++) {
        var element = document.querySelector(selectors[i]);
        if (element) {
            parentObject = element;
            break;
        }
    }

    if (!parentObject) {
        console.error('[Le Git Graph] Could not find repository navigation bar');
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
        console.error('[Le Git Graph] Could not find a tab to clone');
        return;
    }

    var newButton = parentObject.children[sourceTabIndex].cloneNode(true);
    var newButtonChild = newButton.children[0];

    if (!newButtonChild) {
        console.error('[Le Git Graph] Cloned tab structure is invalid');
        return;
    }

    // Configure the new Commits tab
    newButtonChild.id = "commits-tab";
    newButtonChild.setAttribute("aria-disabled", "true");
    newButtonChild.setAttribute("data-tab-item", "commits-tab");
    newButtonChild.removeAttribute("aria-current");
    newButtonChild.classList.remove("selected");
    newButtonChild.setAttribute("data-selected-links", "repo_commits repo_milestones /NirmalScaria/le-git-graph/commits")
    newButtonChild.removeAttribute("href");
    newButtonChild.addEventListener("click", openCommitsTab);

    // Add click handler to other tabs to close Commits view
    Array.from(parentObject.children).forEach((child) => {
        thisChild = child.children[0];
        thisChild.addEventListener("click", closeCommitsTab);
    });

    
    // Update icon - one level deeper due to span wrapper
    newButtonChild.children[0].children[0].setAttribute("class", "octicon octicon-git-commit");
    newButtonChild.children[0].children[0].children[0].setAttribute("d", "M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.75a4.002 4.002 0 01-7.86 0H.75a.75.75 0 110-1.5h3.32a4.001 4.001 0 017.86 0h3.32a.75.75 0 110 1.5h-3.32z");
    newButtonChild.children[0].children[0].children[0].setAttribute("fill-rule", "evenodd");

    // Remove Issues badge
    try {
        newButtonChild.children[0].children[0].removeChild(newButtonChild.children[0].children[0].children[1]);
    } catch {
        // No badge to remove
    }

    // Update label
    try {
        if (newButtonChild.children[1]) {
            newButtonChild.children[1].setAttribute("data-content", "Commits");
            newButtonChild.children[1].innerText = "Commits";
        }
    } catch (e) {
        // Label update failed, continue
    }

    // Remove count indicator (e.g., "Issues 22")
    try {
        if (newButtonChild.children[2]) {
            newButtonChild.removeChild(newButtonChild.children[2]);
        }
    } catch (e) {
        // No counter to remove
    }

    // Insert the Commits tab
    try {
        var insertPosition = parentObject.children[1] || parentObject.children[0];
        if (insertPosition) {
            parentObject.insertBefore(newButton, insertPosition);
        } else {
            parentObject.appendChild(newButton);
        }
    } catch (e) {
        console.error('[Le Git Graph] Failed to insert Commits tab');
        return;
    }

    // Watch for DOM changes during initial load and re-add if GitHub removes the tab
    var observer = new MutationObserver(function() {
        if (!document.getElementById('commits-tab')) {
            addCommitsButton();
        }
    });

    // Observe document.body with subtree to catch nav replacement
    observer.observe(document.body, { 
        childList: true,
        subtree: true
    });

    // Stop observing after initial page load completes (5 seconds)
    setTimeout(function() {
        observer.disconnect();
    }, 5000);


    function closeCommitsTab() {
        isCommitsTabOpen = false;
        var commitsTabButton = document.getElementById("commits-tab");
        commitsTabButton.addEventListener("click", openCommitsTab);
        newButtonChild.removeAttribute("aria-current");
        newButtonChild.removeAttribute("data-selected-links");
    }
}
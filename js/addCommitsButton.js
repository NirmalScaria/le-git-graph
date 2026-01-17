var isCommitsTabOpen = false;
function addCommitsButton() {
    // Check if the Commits tab already exists to prevent duplicates
    var existingTab = document.getElementById('commits-tab');
    if (existingTab) {
        console.log('[Le Git Graph] Commits tab already exists, skipping addition');
        return;
    }

    // parentObject is the bar which contains all the
    // tab buttons, (code, issues, pull requests,..)

    // Try multiple selectors to find the navigation bar (GitHub's DOM structure changes over time)
    var parentObject = null;
    var selectors = [
        'nav[aria-label="Repository"] ul[role="list"]',      // Current GitHub structure (2026+ with CSS Modules)
        'ul[class*="UnderlineItemList"]',                     // CSS Modules fallback (pattern matching)
        'nav[class*="LocalNavigation"] ul',                   // LocalNavigation module fallback
        '.js-responsive-underlinenav ul.UnderlineNav-body',  // Previous GitHub structure (2025)
        'ul.UnderlineNav-body',                               // Fallback: just the class
        '.UnderlineNav-body',                                 // Fallback: without ul
        'nav.UnderlineNav ul',                                // Fallback: nav element
        '[data-pjax="#js-repo-pjax-container"]'              // Legacy selector (pre-2025)
    ];

    for (var i = 0; i < selectors.length; i++) {
        var element = document.querySelector(selectors[i]);
        if (element) {
            // For legacy selector, we need .children[0]
            if (selectors[i] === '[data-pjax="#js-repo-pjax-container"]') {
                parentObject = element.children[0];
            } else {
                parentObject = element;
            }
            console.log('[Le Git Graph] Found navigation bar using selector:', selectors[i]);
            break;
        }
    }

    // If we couldn't find the navigation bar, log error and exit
    if (!parentObject) {
        console.error('[Le Git Graph] Could not find repository navigation bar. Tried selectors:', selectors);
        console.error('[Le Git Graph] Please report this issue at https://github.com/NirmalScaria/le-git-graph/issues');
        return;
    }

    // Copies the "Issues" tab button (or first available tab), and edit it to commits
    // so that the UI matches even if GitHub choose to change UI

    // Find a suitable tab to clone (prefer Issues, but fallback to any available tab)
    var sourceTabIndex = -1;
    for (var j = 0; j < parentObject.children.length; j++) {
        var child = parentObject.children[j];
        // Look for Issues tab or any valid tab
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
        console.error('[Le Git Graph] Could not find a tab to clone from navigation bar');
        return;
    }

    console.log('[Le Git Graph] Cloning tab structure from index:', sourceTabIndex);
    var newButton = parentObject.children[sourceTabIndex].cloneNode(true);
    var newButtonChild = newButton.children[0];

    if (!newButtonChild) {
        console.error('[Le Git Graph] Cloned tab structure is invalid');
        return;
    }
    newButtonChild.id = "commits-tab";
    newButtonChild.setAttribute("aria-disabled", "true");
    newButtonChild.setAttribute("data-tab-item", "commits-tab");
    newButtonChild.removeAttribute("aria-current");
    newButtonChild.classList.remove("selected");
    newButtonChild.setAttribute("data-selected-links", "repo_commits repo_milestones /NirmalScaria/le-git-graph/commits")

    // Remove the href. We wont navigate anywhere.
    newButtonChild.removeAttribute("href");
    newButtonChild.addEventListener("click", openCommitsTab);

    Array.from(parentObject.children).forEach((child) => {
        thisChild = child.children[0];
        thisChild.addEventListener("click", closeCommitsTab);
    });

    // Set the commits button SVG (with error handling)
    try {
        if (newButtonChild.children[0]) {
            newButtonChild.children[0].setAttribute("class", "octicon octicon-issue-opened UnderlineNav-octicon d-none d-sm-inline");
            if (newButtonChild.children[0].children[0]) {
                newButtonChild.children[0].children[0].setAttribute("d", "M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.75a4.002 4.002 0 01-7.86 0H.75a.75.75 0 110-1.5h3.32a4.001 4.001 0 017.86 0h3.32a.75.75 0 110 1.5h-3.32z");
                newButtonChild.children[0].children[0].setAttribute("fill-rule", "evenodd");
            }
            // remove the second child (counter badge from Issues tab)
            try {
                if (newButtonChild.children[0].children[1]) {
                    newButtonChild.children[0].removeChild(newButtonChild.children[0].children[1]);
                }
            } catch (e) {
                console.log('[Le Git Graph] Could not remove counter badge:', e.message);
            }
        }
    } catch (e) {
        console.warn('[Le Git Graph] Could not set SVG icon, using default:', e.message);
    }
    // Set the label to "Commits" (with error handling)
    try {
        if (newButtonChild.children[1]) {
            newButtonChild.children[1].setAttribute("data-content", "Commits");
            newButtonChild.children[1].innerText = "Commits";
        } else {
            console.warn('[Le Git Graph] Could not find label element to set "Commits" text');
        }
    } catch (e) {
        console.warn('[Le Git Graph] Could not set label:', e.message);
    }

    // Remove the count indicator if exists (e.g., "Issues 22")
    try {
        if (newButtonChild.children[2]) {
            newButtonChild.removeChild(newButtonChild.children[2]);
        }
    } catch (e) {
        console.log('[Le Git Graph] No counter to remove or error removing it:', e.message);
    }

    // Add the commits button to the UI
    try {
        // Insert after the Code tab (index 0) or at the beginning if structure is different
        var insertPosition = parentObject.children[1] || parentObject.children[0];
        if (insertPosition) {
            parentObject.insertBefore(newButton, insertPosition);
            console.log('[Le Git Graph] Successfully added Commits tab to navigation');
        } else {
            // Fallback: just append to the end
            parentObject.appendChild(newButton);
            console.log('[Le Git Graph] Added Commits tab at the end of navigation');
        }
    } catch (e) {
        console.error('[Le Git Graph] Failed to insert Commits tab:', e.message);
        return;
    }

    function closeCommitsTab() {
        // Deselect the commits tab.
        // Navigation would be handled automatically by the original GitHub code.
        isCommitsTabOpen = false;
        var commitsTabButton = document.getElementById("commits-tab");
        commitsTabButton.addEventListener("click", openCommitsTab);
        newButtonChild.removeAttribute("aria-current");
        newButtonChild.removeAttribute("data-selected-links");
    }
}
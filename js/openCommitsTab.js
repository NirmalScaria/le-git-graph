async function openCommitsTab() {
    isCommitsTabOpen = true;
    var commitsTabButton = document.getElementById("commits-tab");
    commitsTabButton.removeEventListener("click", openCommitsTab);

    showCommitsLoading();

    // Find the navigation bar with fallback selectors
    var parentObject = null;
    var selectors = [
        'nav[aria-label="Repository"] ul[role="list"]',      // Current GitHub (2026+)
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

    var branches = [];
    var selectedBranchNames = [];

    // Find the Commits tab button
    var newButton = null;
    var newButtonChild = null;

    for (var j = 0; j < parentObject.children.length; j++) {
        var child = parentObject.children[j];
        if (child && child.children && child.children[0]) {
            if (child.children[0].id === 'commits-tab') {
                newButton = child;
                newButtonChild = child.children[0];
                break;
            }
        }
    }

    if (!newButton || !newButtonChild) {
        console.error('[Le Git Graph] Could not find Commits tab button');
        return;
    }

    // Select the commits tab.
    function setCommitsButtonAsActive() {
        if (isCommitsTabOpen == false) {
            return;
        }
        newButtonChild.setAttribute("aria-current", "page");

        // Deselect all the tabs except commits tab.
        Array.from(parentObject.children).forEach((child) => {
            if (child.children[0].id != "commits-tab") {
                child.children[0].removeAttribute("aria-current");
                child.children[0].classList.remove("selected");
            }
        });
    }
    setCommitsButtonAsActive();
    var i = 0;
    var interval = setInterval(() => {
        setCommitsButtonAsActive();
        i++;
        if (i == 10) {
            clearInterval(interval);
        }
    }, 1000);

    // Try to fetch stored authorization token
    var authorizationToken = getLocalToken();
    var storedUserName = getLocalUserName();
    if (authorizationToken == null || storedUserName == null) {
        // Prompt the user to authorize with GitHub
        await addAuthorizationPrompt("GitHub repo access is required to fetch the commits information.");
    }
    else {
        console.log("Authorization token found: " + authorizationToken);

        // Load the commits of all branches and show the default view
        await fetchCommits();
    }

    // TODO : Move all the below code (with necessary modifications)
    //  to showCommits() function.

    // await loadBranchesButton();

    // Fetches the branch data from API.
    // [branches, selectedBranchNames] = await fetchActiveBranches();

    // Set the branches to dropdown
    // setBranchOptions(branches, selectedBranchNames);

    // Fetch the commits from API.
    // await fetchCommits(branches);
}
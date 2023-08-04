// NOTE: IMPORTANT!
// This file is heavily version specific.
// Either avoid FRE by making changes in serviceWorker.js
// or make changes here to make it work with the current version.
async function updateFre(resume) {
    openCommitsTab();
    keepCheckingForAuth(updateFreStep1, clearToolTip);
}

async function updateFreStep1() {
    createOverlay();
    clearToolTip();
    var branchSelectButton = document.getElementById("branch-select-menu-button");
    var branchesSelectionMenu = document.getElementById("branches-selection-menu");
    branchSelectButton.click();
    focusOnItem(branchesSelectionMenu, [10, 40, 10, 10]);
    showToolTip(
        branchesSelectionMenu,
        "left-top",
        "Welcome to Le Git Graph 1.2.0",
        "Now you can apply filters to branches ✨",
        "You can select which branches to show in the graph by selecting the branch names in the branches selection menu",
        ["Continue"],
        ["btn-primary"],
        [nextFrom1]
    );
    function nextFrom1() {
        var branchSelectButton = document.getElementById("branch-select-menu-button");
        branchSelectButton.click();
        updateFreStep2();
    }
}

async function updateFreStep2() {
    clearToolTip();
    createOverlay();
    focusOnItem(null, [0, 0, 0, 0]);
    showToolTip(
        document,
        "cover",
        "Please rate on Chrome Web Store",
        "Enjoying the extension so far? ✨",
        "Please rate the extension on Chrome Web Store. It will take less than a minute, but will help me reach more people.",
        ["Previous", "Maybe later", "Rate on Chrome Web Store"],
        ["btn-secondary", "btn-secondary", "btn-primary"],
        [updateFreStep1, finishFre, openChromeWebstore]
    )
    function openChromeWebstore() {
        window.open("https://chrome.google.com/webstore/detail/le-git-graph-commits-grap/joggkdfebigddmaagckekihhfncdobff/reviews", "_blank");
        clearToolTip();
    }
    function finishFre() {
        clearToolTip();
    }
}
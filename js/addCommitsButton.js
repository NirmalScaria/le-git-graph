function addCommitsButton() {
    // parentObject is the bar which contains all the
    // tab buttons, (code, issues, pull requests,..)
    var parentObject = document.querySelector('[data-pjax="#js-repo-pjax-container"]').children[0];

    // Copies the "Issues" tab button, and edit it to commits
    // so that the UI matches even if GitHub choose to change UI
    var newButton = parentObject.children[0].cloneNode(true);
    var newButtonChild = newButton.children[0];
    newButtonChild.id = "commits-tab";
    newButtonChild.setAttribute("aria-disabled", "true");
    newButtonChild.setAttribute("data-tab-item", "commits-tab");
    newButtonChild.removeAttribute("aria-current");
    newButtonChild.classList.remove("selected");

    // Remove the href. We wont navigate anywhere.
    newButtonChild.removeAttribute("href");
    newButtonChild.addEventListener("click", openCommitsTab);

    Array.from(parentObject.children).forEach((child) => {
        thisChild = child.children[0];
        thisChild.addEventListener("click", closeCommitsTab);
    });

    // Set the commits button SVG
    newButtonChild.children[0].setAttribute("class", "octicon octicon-issue-opened UnderlineNav-octicon d-none d-sm-inline");
    // newButtonChild.children[0].removeChild(newButtonChild.children[0].children[0]);
    newButtonChild.children[0].children[0].setAttribute("d", "M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.75a4.002 4.002 0 01-7.86 0H.75a.75.75 0 110-1.5h3.32a4.001 4.001 0 017.86 0h3.32a.75.75 0 110 1.5h-3.32z");

    // Set the label to "Commits"
    newButtonChild.children[1].setAttribute("data-content", "Commits");
    newButtonChild.children[1].innerText = "Commits";

    // Remove the count indicator if exists.
    if (newButtonChild.children[2]) {
        newButtonChild.removeChild(newButtonChild.children[2]);
    }

    // Add the commits button to the UI
    parentObject.insertBefore(newButton, parentObject.children[1]);

    function closeCommitsTab() {
        // Deselect the commits tab.
        // Navigation would be handled automatically by the original GitHub code.
        newButtonChild.removeAttribute("aria-current");
        newButtonChild.removeAttribute("data-selected-links");
    }
}
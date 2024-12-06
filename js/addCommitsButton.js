// Listen for GitHub's navigation events at the top level
document.addEventListener('turbo:load', reinitializeButton);
document.addEventListener('pjax:end', reinitializeButton);
document.addEventListener('DOMContentLoaded', reinitializeButton);

function reinitializeButton() {
    const pathsToExclude = ["login", "oauth", "authorize"];
    const windowPathArray = window.location.pathname.split("/");
    
    // First remove any existing button to prevent duplicates
    const existingButton = document.getElementById('commits-tab');
    if (existingButton) {
        existingButton.parentElement.remove();
    }
    
    if (!pathsToExclude.includes(windowPathArray[1])) {
        addCommitsButton();
    }
}

var isCommitsTabOpen = false;
function addCommitsButton() {
    try {
        // Find all possible navigation containers
        const containers = [
            document.querySelector('[data-pjax="#js-repo-pjax-container"]'),
            document.querySelector('[data-pjax="#repo-content-pjax-container"]'),
            document.querySelector('.UnderlineNav-body')  // Pull request navigation
        ].filter(Boolean); // Remove null/undefined values

        if (containers.length === 0) return;

        // Use the first available container
        const parentObject = containers[0].children[0];
        if (!parentObject) return;

        var newButton = parentObject.children[1].cloneNode(true);
        var newButtonChild = newButton.children[0];
        newButtonChild.id = "commits-tab";
        newButtonChild.setAttribute("aria-disabled", "true");
        newButtonChild.setAttribute("data-tab-item", "commits-tab");
        newButtonChild.removeAttribute("aria-current");
        newButtonChild.classList.remove("selected");
        newButtonChild.setAttribute("data-selected-links", "repo_commits repo_milestones /NirmalScaria/le-git-graph/commits");

        // Remove existing event listeners before adding new ones
        newButtonChild.replaceWith(newButtonChild.cloneNode(true));
        newButtonChild = newButton.children[0];
        
        // Remove the href. We wont navigate anywhere.
        newButtonChild.removeAttribute("href");
        newButtonChild.addEventListener("click", openCommitsTab);

        Array.from(parentObject.children).forEach((child) => {
            const thisChild = child.children[0];
            // Remove existing listeners before adding new one
            const newChild = thisChild.cloneNode(true);
            thisChild.replaceWith(newChild);
            newChild.addEventListener("click", closeCommitsTab);
        });

        // Set the commits button SVG
        newButtonChild.children[0].setAttribute("class", "octicon octicon-issue-opened UnderlineNav-octicon d-none d-sm-inline");
        newButtonChild.children[0].children[0].setAttribute("d", "M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.75a4.002 4.002 0 01-7.86 0H.75a.75.75 0 110-1.5h3.32a4.001 4.001 0 017.86 0h3.32a.75.75 0 110 1.5h-3.32z");
        newButtonChild.children[0].children[0].setAttribute("fill-rule", "evenodd");
        
        try {
            newButtonChild.children[0].removeChild(newButtonChild.children[0].children[1]);
        } catch {
            // The repo has no issues tab
        }
        
        // Set the label to "Commits"
        newButtonChild.children[1].setAttribute("data-content", "Commits");
        newButtonChild.children[1].innerText = "Commits";

        // Remove the count indicator if exists.
        if (newButtonChild.children[2]) {
            newButtonChild.removeChild(newButtonChild.children[2]);
        }

        // Add the commits button to the UI
        parentObject.insertBefore(newButton, parentObject.children[1]);
    } catch (error) {
        console.debug('Failed to add commits button:', error);
    }
}

function closeCommitsTab() {
    // Deselect the commits tab.
    // Navigation would be handled automatically by the original GitHub code.
    isCommitsTabOpen = false;
    var commitsTabButton = document.getElementById("commits-tab");
    if (commitsTabButton) {
        commitsTabButton.addEventListener("click", openCommitsTab);
        commitsTabButton.removeAttribute("aria-current");
        commitsTabButton.removeAttribute("data-selected-links");
    }
}
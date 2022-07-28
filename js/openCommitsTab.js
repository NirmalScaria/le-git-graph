async function openCommitsTab() {
    var parentObject = document.querySelector('[data-pjax="#js-repo-pjax-container"]').children[0];

    // Contains all the branch objects
    var branches = [];

    // Keeps the SHAs of only those branches which are 
    // selected by the user
    var selectedBranchNames = [];

    // Copies the "Issues" tab button, and edit it to commits
    // so that the UI matches even if GitHub choose to change UI
    var newButton = parentObject.children[1];
    var newButtonChild = newButton.children[0];

    // Deselect all the tabs except commits tab.
    Array.from(parentObject.children).forEach((child) => {
        if (child.children[0].id != "commits-tab") {
            child.children[0].removeAttribute("aria-current");
            child.children[0].classList.remove("selected");
        }
    });

    // Select the commits tab.
    newButtonChild.setAttribute("aria-current", "page");

    // Add the branches dropdown to select/deselect branches to show.
    await loadBranchesButton();

    // Fetches the branch data from API.
    [branches, selectedBranchNames] = await fetchBranches();

    console.log(branches);
    console.log(selectedBranchNames);

    // Set the branches to dropdown
    setBranchOptions(branches, selectedBranchNames);

    function main() {
        var currentUrl = window.location.href;
        var splitUrl = currentUrl.split('/');
        var repoOwner = splitUrl[3]
        var repoName = splitUrl[4];
        var commitsAPI = `https://api.github.com/repos/${repoOwner}/${repoName}/commits?`;
        var branchesAPI = `https://api.github.com/repos/${repoOwner}/${repoName}/branches`;
        var allCommits = [];
        fetch(branchesAPI)
            .then(response => response.json())
            .then(branches => {
                branches.forEach(branch => {
                    var branchName = branch.name;
                    // fetch commitsapi
                    fetch(commitsAPI + new URLSearchParams({
                        sha: branchName,
                    }))
                        .then(response => response.json())
                        .then(commits => {
                            commits.forEach(commit => {
                                var commitMessage = commit.commit.message;
                            }
                            )
                        });
                });
            }
            );
    }
}
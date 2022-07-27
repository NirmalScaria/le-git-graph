async function fetchBranches() {
    var currentUrl = window.location.href;
    var splitUrl = currentUrl.split('/');
    var repoOwner = splitUrl[3]
    var repoName = splitUrl[4];
    var commitsAPI = `https://api.github.com/repos/${repoOwner}/${repoName}/commits?`;
    var branchesAPI = `https://api.github.com/repos/${repoOwner}/${repoName}/branches`;
    var allCommits = [];
    var branches = [];
    var selectedBranchIds = [];
    await fetch(branchesAPI)
        .then(response => response.json())
        .then(fetchedBranches => {
            branches = fetchedBranches;
            fetchedBranches.forEach(branch => {
                selectedBranchIds.push(branch.commit.sha);
            });

            var sizedContainer = document.getElementById("branches-sized-container");
            sizedContainer.style.height = (35 * branches.length + 20) + "px";

        });
    return ([branches, selectedBranchIds]);
}
async function fetchBranches() {
    var currentUrl = window.location.href;
    var splitUrl = currentUrl.split('/');
    var repoOwner = splitUrl[3]
    var repoName = splitUrl[4];
    var branchesAPI = `https://api.github.com/repos/${repoOwner}/${repoName}/branches?per_page=100`;
    var branches = [];
    var selectedBranchNames = [];
    var mainBranch, masterBranch, devBranch, developBranch, stableBranch;
    async function fetchBrachesPage(pageNo) {
        console.log("Fetching page " + pageNo);
        await fetch(branchesAPI + `&page=${pageNo}`).then(response => response.json()).then(async fbranches => {
            fbranches.forEach(branch => {
                if (branch.name == "main") {
                    mainBranch = branch;
                }
                else if (branch.name == "master") {
                    masterBranch = branch;
                }
                else if (branch.name == "dev") {
                    devBranch = branch;
                }
                else if (branch.name == "stable") {
                    stableBranch = branch;
                }
                else if (branch.name == "develop") {
                    developBranch = branch;
                }
                else {
                    branches.push(branch);
                    selectedBranchNames.push(branch.name);
                }
            });
            if (fbranches.length >= 100) {
                await fetchBrachesPage(pageNo + 1);
            }
        });
    }
    await fetchBrachesPage(1);

    // Add the special branches (main, master, dev, etc) to the beginning
    [devBranch, developBranch, stableBranch, mainBranch, masterBranch].forEach(specialBranch => {
        if (specialBranch != undefined) {
            branches.unshift(specialBranch);
            selectedBranchNames.unshift(specialBranch.name);
        }
    });
    var sizedContainer = document.getElementById("branches-sized-container");
    sizedContainer.style.height = (35 * branches.length + 45) + "px";

    return ([branches, selectedBranchNames]);
}
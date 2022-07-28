async function fetchBranches() {
    var currentUrl = window.location.href;
    var splitUrl = currentUrl.split('/');
    var repoOwner = splitUrl[3]
    var repoName = splitUrl[4];
    var branchesAPI = `https://github.com/${repoOwner}/${repoName}/branches`;
    var branches = [];
    var selectedBranchNames = [];
    async function fetchRecentBranches() {
        await fetch(branchesAPI).then(response => response.text()).then(async fbranches => {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = fbranches;
            var branchesUI = tempDiv.getElementsByClassName("branch-name");
            Array.from(branchesUI).forEach(branchUI => {
                if (!branches.includes(branchUI.innerText)) {
                    branches.push(branchUI.innerText);
                    selectedBranchNames.push(branchUI.innerText);
                }
            });
        });
    }
    async function fetchBrachesPage(pageNo) {
        var thisPageUrl = `https://github.com/${repoOwner}/${repoName}/branches/active?page=` + pageNo;
        var nextPageUrl = `https://github.com/${repoOwner}/${repoName}/branches/active?page=` + (pageNo + 1);
        await fetch(thisPageUrl).then(response => response.text()).then(async fbranches => {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = fbranches;
            var branchesUI = tempDiv.getElementsByClassName("branch-name");
            Array.from(branchesUI).forEach(branchUI => {
                if (!branches.includes(branchUI.innerText)) {
                    branches.push(branchUI.innerText);
                    selectedBranchNames.push(branchUI.innerText);
                }
            });
            var nextElement = tempDiv.querySelector(`[href="${nextPageUrl}"]`);
            if (nextElement != null) {
                await fetchBrachesPage(pageNo + 1);
            }
        });
    }
    await fetchRecentBranches();
    await fetchBrachesPage(1);


    var sizedContainer = document.getElementById("branches-sized-container");
    sizedContainer.style.height = (35 * branches.length + 45) + "px";

    return ([branches, selectedBranchNames]);
}
// To convert ISO date to Date object
const parseDate = dateString => {
    const b = dateString.split(/\D+/);
    const offsetMult = dateString.indexOf('+') !== -1 ? -1 : 1;
    const hrOffset = offsetMult * (+b[7] || 0);
    const minOffset = offsetMult * (+b[8] || 0);
    return new Date(Date.UTC(+b[0], +b[1] - 1, +b[2], +b[3] + hrOffset, +b[4] + minOffset, +b[5], +b[6] || 0));
};

async function showCommits(branches) {

    // Display the branches filter dropdown button with default value only (All branches)
    await loadBranchesButton();

    var branchNames = [];
    var commitsObject = {};

    console.log("--SORTING STARTED--");

    for (var branch of branches) {
        var branchname = branch.name;
        var thisCommits = branch.target.history.edges;
        for (var thisCommit in thisCommits) {
            var commit = thisCommits[thisCommit].node;
            if (commit.oid in commitsObject) {
                commitsObject[commit.oid].branches.push(branchname);
            }
            else {
                commitsObject[commit.oid] = commit
                commit.branches = [branchname];
            }
        }
    }

    var commits = [];
    for (var commitId in commitsObject) {
        commits.push(commitsObject[commitId]);
    }
    commitsObject = commits;
    commits.sort(function (a, b) {
        return parseDate(b.authoredDate) - parseDate(a.authoredDate);
    });

    commits.forEach(commit => {
        var brancesInThisCommit = commit.branches;
        brancesInThisCommit.forEach(thisBranch => {
            if (!branchNames.includes(thisBranch)) {
                branchNames.push(thisBranch);
            }
        });
    });

    setBranchOptions(branchNames, branchNames);
    console.log("--SORTED FINISHED--");
    console.log("--COMMITS FOR FIRST PAGE ARE--");
    console.log(commitsObject.slice(0, 10));
}
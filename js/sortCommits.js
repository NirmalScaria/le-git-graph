// To convert ISO date to Date object
const parseDate = dateString => {
    if (typeof dateString === 'object') {
        return (dateString);
    }
    const b = dateString.split(/\D+/);
    const offsetMult = dateString.indexOf('+') !== -1 ? -1 : 1;
    const hrOffset = offsetMult * (+b[7] || 0);
    const minOffset = offsetMult * (+b[8] || 0);
    return new Date(Date.UTC(+b[0], +b[1] - 1, +b[2], +b[3] + hrOffset, +b[4] + minOffset, +b[5], +b[6] || 0));
};

async function sortCommits(branches, heads) {
    var branchNames = {};
    var commitsObject = {};

    // The branches array contains the name of branch as well as
    // the commit history (latest 10 per branch) on the branch
    // This loop gets these commits and arranges it into a dictionary
    for (var branch of branches) {
        var branchname = branch.name;
        var thisCommits = branch.target.history.edges;
        for (var thisCommit in thisCommits) {
            var commit = thisCommits[thisCommit].node;
            if (commit.oid in commitsObject && commitsObject[commit.oid].branches != null) {
                commitsObject[commit.oid].branches.push(branchname);
            }
            else {
                commitsObject[commit.oid] = commit
                commit.branches = [branchname];
                commit.committedDate = parseDate(commit.committedDate);
            }
        }
    }

    // Generage an array that contains the commits
    var commits = [];
    for (var commitId in commitsObject) {
        commits.push(commitsObject[commitId]);
    }
    commitsObject = commits;

    // Sort the commits based on the date they were committed
    commits.sort(function (a, b) {
        return b.committedDate - a.committedDate;
    });

    commits.forEach(commit => {
        var brancesInThisCommit = commit.branches;
        if (brancesInThisCommit != undefined) {
            brancesInThisCommit.forEach(thisBranch => {
                // if (!branchNames.includes(thisBranch)) {
                    // branchNames.push(thisBranch);
                // }
                branchNames[thisBranch] = "";
            });
        }
    });

    for(var branch of branches){
        branchNames[branch.name] = branch.target.history.edges[0].node.oid;
    }

    console.log("--COMMITS FOR THIS PAGE ARE--");
    console.log(commitsObject.slice(0, 10));
    await showCommits(commitsObject.slice(0, 10), branchNames, commits, heads, 1);
    showLegend(heads);
}
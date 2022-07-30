async function fetchCommits(branches) {
    var currentUrl = window.location.href;
    var splitUrl = currentUrl.split('/');
    var repoOwner = splitUrl[3]
    var repoName = splitUrl[4];
    var commitsAPI = `https://api.github.com/repos/${repoOwner}/${repoName}/commits?`;
    var allCommits = [];
    branches.forEach(branch => {
        var branchName = branch;
        // fetch commitsapi
        fetch(commitsAPI + new URLSearchParams({
            sha: branchName,
        }))
            .then(response => response.json())
            .then(commits => {
                commits.forEach(commit => {
                    var commitMessage = commit.commit.message;
                    allCommits.push(commitMessage);
                }
                );
            }
            );
    }
    );
    console.log(allCommits);
    return allCommits;
}
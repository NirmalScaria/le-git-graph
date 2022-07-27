function openCommitsTab() {
    var parentObject = document.querySelector('[data-pjax="#js-repo-pjax-container"]').children[0];

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

    var contentView = document.getElementsByClassName("clearfix")[0];
    var html = chrome.runtime.getURL('html/branchSelection.html');
    fetch(html).then(response => response.text()).then(text => {
        contentView.innerHTML = text;
    });



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
                                console.log(commitMessage);
                            }
                            )
                        });
                    console.log(branchName);
                });
            }
            );
    }
    // main();
}
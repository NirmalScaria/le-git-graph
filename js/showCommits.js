async function getCommitDetails(repoOwner, repoName, commits) {
    var queryBeginning = `
    query { 
        rateLimit {
            limit
            cost
            remaining
            resetAt
          }
        repository(owner:"`+ repoOwner + `", name: "` + repoName + `") {`;
    var queryContent = queryBeginning;
    for (var i = 0; i < commits.length; i++) {
        queryContent += `
        commit`+ i + `: object(oid: "` + commits[i].oid + `") {
            ... on Commit{
                parents(first:100) {
                    edges {
                      node {
                        ... on Commit{
                          oid
                        }
                      }
                    }
                  }
                author{
                  name
                  user{
                    login
                    avatarUrl
                  }
                }
              }
            }`;
    }
    queryContent += ` } } `;
    var endpoint = "https://api.github.com/graphql";
    var headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getLocalToken()
    };
    var body = {
        query: queryContent
    };
    var response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
    });
    if ((response.status != 200 && response.status != 201)) {
        console.log("--ERROR FETCHING GRAPHQL--");
        addAuthorizationPrompt("Failed to fetch commits. Make sure your GitHub account has access to the repository.");
        return (false);
    }
    var data = await response.json();
    console.log(data);
    if (data.error) {
        console.log("--ERROR FETCHING GRAPHQL--");
        addAuthorizationPrompt("Failed to fetch commits. Make sure your GitHub account has access to the repository.");
        return (false);
    }
    var commitDetails = data.data.repository;
    for (var i = 0; i < commits.length; i++) {
        commits[i].author = commitDetails['commit' + i].author.name;
        commits[i].authorAvatar = commitDetails['commit' + i].author.user.avatarUrl;
        commits[i].authorLogin = commitDetails['commit' + i].author.user.login;
        commits[i].parents = commitDetails['commit' + i].parents.edges;
    }
    console.log(commits);
}

async function showCommits(commits) {
    var presentUrl = window.location.href;
    var repoOwner = presentUrl.split('/')[3];
    var repoName = presentUrl.split('/')[4];
    getCommitDetails(repoOwner, repoName, commits);
    // return;
    var contentView = document.getElementsByClassName("clearfix")[0];
    var commitsLoadingHtml = chrome.runtime.getURL('html/commitsContainer.html');
    var commitsContainer;
    await fetch(commitsLoadingHtml).then(response => response.text()).then(commitsContainerHtmlText => {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = commitsContainerHtmlText;
        commitsContainer = tempDiv.firstChild;
        contentView.appendChild(commitsContainer);
    });
    var commitItemHtml = chrome.runtime.getURL('html/commitItem.html');
    await fetch(commitItemHtml).then(response => response.text()).then(commitItemHtmlText => {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = commitItemHtmlText;
        var commitItem = tempDiv.firstChild;
        for (var commit of commits) {
            var newCommitItem = commitItem.cloneNode(true);
            newCommitItem.setAttribute("data-url", "/" + repoOwner + "/" + repoName + "/commits/" + commit.oid + "/commits_list_item");
            newCommitItem.setAttribute("commitSha", commit.oid);
            newCommitItem.querySelector("#commitMessage").innerHTML = commit.messageHeadlineHTML;
            newCommitItem.querySelector("#commitMessage").setAttribute("href", "/" + repoOwner + "/" + repoName + "/commit/" + commit.oid);
            commitsContainer.appendChild(newCommitItem);
        }
    });
    return;
}


async function fetchFilteredCommits(selectedBranchNames, selectedBranches, allBranches) {
    var branches = [];
    // Recurcively call this function unti all the branches are fetched
    // (GitHub API has a limit of 100 branches per request)

    var APIcost = 0;

    // The cost depends on the complexity of query that GitHub will have to do
    // First, fetch the commits with just the time, so that top ones to show can be found
    // Then request the rest of the details (like parents) of commits in another request.
    // NOTE : Return true if the request is successful, false otherwise
    async function fetchCommitsPageFiltered(repoOwner, repoName, lastFetched) {
        if (lastFetched == "NONE") {
            console.log("--FETCHING COMMITS STARTED--");
        }
        else {
            console.log("--STILL FETCHING... TOO MANY BRANCHES--");
        }
        var endpoint = "https://api.github.com/graphql";
        if (lastFetched == "NONE") {
            var initialQuery = `
            fragment branch on Commit {
                        history(first: 10) {
                          edges {
                            node {
                              ... on Commit {
                                oid
                                messageHeadlineHTML
                                committedDate
                              }
                            }
                          }
                        }
              }
            
            {
                repository(owner: "` + repoOwner + `", name: "` + repoName + `") {
            `;
            for (var i = 0; i < selectedBranches.length; i++) {
                initialQuery += encode(selectedBranchNames[i]) + ` : object(oid: "` + selectedBranches[i] + `") {
                        ...branch
                    }
                `;
            }
            initialQuery += `
                }
                rateLimit {
                    limit
                    cost
                    remaining
                    resetAt
                }
            }`;
        }
        else {
            var initialQuery = `
            {
                repository(owner: "`+ repoOwner + '", name: "' + repoName + `") {
                    refs(refPrefix: "refs/heads/", orderBy: {direction: DESC, field: TAG_COMMIT_DATE}, first:100, after: "` + lastFetched + `") {
                        edges {
                            cursor
                            node {
                                ... on Ref {
                                    name
                                    target {
                                        ... on Commit {
                                            history(first: 10) {
                                                edges {
                                                    node {
                                                        ... on Commit {
                                                            oid
                                                            messageHeadlineHTML
                                                            committedDate
                                                        }  
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                rateLimit {
                    limit
                    cost
                    remaining
                    resetAt
                }
            }`;
        }
        var headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getLocalToken()
        };
        var body = {
            query: initialQuery
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
        if (data.error || data.errors) {
            console.log("--ERROR FETCHING GRAPHQL--");
            addAuthorizationPrompt("Failed to fetch commits. Make sure your GitHub account has access to the repository.");
            return (false);
        }
        var fetchedBranches = [];
        for (var branch in data.data.repository) {
            var thisBranch = data.data.repository[branch];
            thisBranch.name = decode(branch)
            fetchedBranches.push(thisBranch);
        }
        fetchedBranches.forEach(branch => {
            var commit = branch;
            branches.push(commit);
        });
        if (fetchedBranches.length >= 100) {
            var lastFetchedCursor = fetchedBranches[fetchedBranches.length - 1].cursor;
            if (await fetchCommitsPageFiltered(repoOwner, repoName, lastFetchedCursor) == false) {
                return (false);
            };
        }
        APIcost += data.data.rateLimit.cost;
        return (true);
    }

    var currentUrl = window.location.href;
    var splitUrl = currentUrl.split('/');
    var repoOwner = splitUrl[3]
    var repoName = splitUrl[4];

    var heads = [];

    // fetchCommitsPage returns true only if the fetch was successful
    if (await fetchCommitsPageFiltered(repoOwner, repoName, "NONE")) {
        console.log("--FETCHED BRANCHES--");
        console.log("--COST : '" + APIcost + "'--");
        branches = branches.map(branchOriginal => {
            var branch = JSON.parse(JSON.stringify(branchOriginal));
            heads.push({
                name: branch.name,
                oid: branch.history.edges[0].node.oid,
            });
            branch.target = {}
            branch.target.history = branch.history;
            branch.target.history.edges[0].node.isHead = true;
            return branch;
        })
        await sortCommits(branches, heads, allBranches);
    }
    else {
        console.log("Fetch failure");
    }
}

// Branch names of git allows a lot of flexibiliity in variable naming
// Many special characters are allowed. But, graphql doesnt seem to accept all of it
// Hence, converting the UTF-8 characters to a 4 digit number for each character
// And decoding back.
function encode(string) {
    var res = "XX"
    for (var i = 0; i < string.length; i++) {
        res += string.charCodeAt(i).toString().padStart(4, 0)
    }
    return (res)
}

function decode(string) {
    string = string.substr(2)
    var res = ""
    for (var i = 0; i < string.length; i += 4) {
        res += String.fromCharCode(parseInt(string.substr(i, 4)))
    }
    return (res)
}
async function fetchCommits() {
    var branches = [];
    // Recurcively call this function unti all the branches are fetched
    // (GitHub API has a limit of 100 branches per request)

    var APIcost = 0;

    // The cost depends on the complexity of query that GitHub will have to do
    // First, fetch the commits with just the time, so that top ones to show can be found
    // Then request the rest of the details (like parents) of commits in another request.
    // NOTE : Return true if the request is successful, false otherwise
    async function fetchCommitsPage(repoOwner, repoName, lastFetched) {
        if (lastFetched == "NONE") {
            console.log("--FETCHING COMMITS STARTED--");
        }
        else {
            console.log("--STILL FETCHING... TOO MANY BRANCHES--");
        }
        var endpoint = "https://api.github.com/graphql";
        if (lastFetched == "NONE") {
            var initialQuery = `
            {
                repository(owner: "`+ repoOwner + '", name: "' + repoName + `") {
                    refs(refPrefix: "refs/heads/", orderBy: {direction: DESC, field: TAG_COMMIT_DATE}, first:100) {
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
        if (data.error) {
            console.log("--ERROR FETCHING GRAPHQL--");
            addAuthorizationPrompt("Failed to fetch commits. Make sure your GitHub account has access to the repository.");
            return (false);
        }
        var fetchedBranches = data.data.repository.refs.edges;
        fetchedBranches.forEach(branch => {
            var commit = branch.node;
            branches.push(commit);
        });
        if (fetchedBranches.length >= 100) {
            var lastFetchedCursor = fetchedBranches[fetchedBranches.length - 1].cursor;
            if (await fetchCommitsPage(repoOwner, repoName, lastFetchedCursor) == false) {
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

    // fetchCommitsPage returns true only if the fetch was successful
    if (await fetchCommitsPage(repoOwner, repoName, "NONE")) {
        console.log("--FETCHED BRANCHES--");
        console.log("--COST : '" + APIcost + "'--");
        console.log(branches);
        await sortCommits(branches);
    }
}
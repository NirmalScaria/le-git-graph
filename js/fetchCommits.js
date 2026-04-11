async function fetchCommits() {
    var branches = [];
    // Fetch all branches with pagination
    // (GitHub API has a limit of 100 branches per request)

    var APIcost = 0;
    var commitsPerPage = await getCommitsPerPage();

    function buildBranchQuery(repoOwner, repoName, cursor) {
        var afterClause = cursor ? ', after: "' + cursor + '"' : '';
        return `
        {
            repository(owner: "` + repoOwner + '", name: "' + repoName + `") {
                refs(refPrefix: "refs/heads/", orderBy: {direction: DESC, field: TAG_COMMIT_DATE}, first:100` + afterClause + `) {
                    edges {
                        cursor
                        node {
                            ... on Ref {
                                name
                                target {
                                    ... on Commit {
                                        history(first: ` + commitsPerPage + `) {
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

    async function fetchCommitsPage(repoOwner, repoName, cursor) {
        console.log(cursor ? "--STILL FETCHING... TOO MANY BRANCHES--" : "--FETCHING COMMITS STARTED--");
        var endpoint = "https://api.github.com/graphql";
        var headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getLocalToken()
        };
        var body = {
            query: buildBranchQuery(repoOwner, repoName, cursor)
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
        var fetchedBranches = data.data.repository.refs.edges;
        fetchedBranches.forEach(branch => {
            var commit = branch.node;
            branches.push(commit);
        });
        APIcost += data.data.rateLimit.cost;

        if (fetchedBranches.length >= 100) {
            var lastFetchedCursor = fetchedBranches[fetchedBranches.length - 1].cursor;
            if (await fetchCommitsPage(repoOwner, repoName, lastFetchedCursor) == false) {
                return (false);
            };
        }
        return (true);
    }

    var currentUrl = window.location.href;
    var splitUrl = currentUrl.split('/');
    var repoOwner = splitUrl[3]
    var repoName = splitUrl[4];

    var heads = [];

    // fetchCommitsPage returns true only if the fetch was successful
    if (await fetchCommitsPage(repoOwner, repoName, "NONE")) {
        console.log("--FETCHED BRANCHES--");
        console.log("--COST : '" + APIcost + "'--");
        var allBranchesObject = {}
        branches = branches.map(branch => {
            heads.push({
                name: branch.name,
                oid: branch.target.history.edges[0].node.oid,
            });
            allBranchesObject[branch.name] = branch.target.history.edges[0].node.oid;
            branch.target.history.edges[0].node.isHead = true;
            return branch;
        })
        await sortCommits(branches, heads, allBranchesObject);
    }
}
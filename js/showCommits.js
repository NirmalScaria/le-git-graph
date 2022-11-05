function assignColors(commits) {
  var commitDict = {}
  for (var commit of commits) {
    commitDict[commit.oid] = commit
  }
  // TODO : Define good colours properly
  var colors = ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7"]

  var commitIndex = 0;
  // For each commit, assign a colour
  // If the commit has a parent, assign the same colour to the parent
  // If the commit has no parent, assign a random colour
  // If the commit has two parents, assign the original colour to first parent (merge target branch)
  // and a random colour to the second parent (merge source branch)
  for (var commit of commits) {
    var commitsha = commit.oid
    commit = commitDict[commitsha];
    if (commit.color == null) {
      commit.color = colors[commitIndex % colors.length];
      commit.lineIndex = commitIndex;
    }
    commitIndex += 1;
    if (commit.parents.length > 0) {
      if (commit.parents[0].node.oid in commitDict && commitDict[commit.parents[0].node.oid].color == null) {
        commitDict[commit.parents[0].node.oid].color = commit.color;
        commitDict[commit.parents[0].node.oid].lineIndex = commit.lineIndex;
      }
    }
  }
  return ([commits, commitDict]);
}


// Get the required commit details from api
// commits parameter contains the commit shas
async function getCommitDetails(repoOwner, repoName, commits, allCommits) {
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
  for (var i = Math.max(0, commits.length - 11); i < commits.length; i++) {
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
    if (commitDetails['commit' + i] == undefined) {
      continue;
    }
    commits[i].author = commitDetails['commit' + i].author.name;
    if (commitDetails['commit' + i].author.user != null) {
      commits[i].authorAvatar = commitDetails['commit' + i].author.user.avatarUrl;
      commits[i].authorLogin = commitDetails['commit' + i].author.user.login;
      commits[i].hasUserData = true;
    }
    else {
      commits[i].authorAvatar = "";
      commits[i].authorLogin = commitDetails['commit' + i].author.name;
      commits[i].hasUserData = false;
    }
    commits[i].parents = commitDetails['commit' + i].parents.edges;
  }
  for (var commit of commits) {
    for (var target of allCommits) {
      if (commit.oid == target.oid) {
        target.author = commit.author;
        target.authorAvatar = commit.authorAvatar;
        target.authorLogin = commit.authorLogin;
        target.hasUserData = commit.hasUserData;
        target.parents = commit.parents;
      }
    }
  }
  return ([commits, allCommits]);
}

async function showCommits(commits, branchNames, allCommits, heads, pageNo) {
  var presentUrl = window.location.href;
  var repoOwner = presentUrl.split('/')[3];
  var repoName = presentUrl.split('/')[4];
  [commits, allCommits] = await getCommitDetails(repoOwner, repoName, commits, allCommits);
  var contentView = document.getElementsByClassName("clearfix")[0];

  var commitsContainerDummy = document.createElement("div");

  var commitsOutsideContainer;
  var commitsLoadingHtml = chrome.runtime.getURL('html/commitsContainer.html');
  var commitsGraphContainer;

  var commitDict;
  [commits, commitDict] = assignColors(commits);
  await fetch(commitsLoadingHtml).then(response => response.text()).then(commitsContainerHtmlText => {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = commitsContainerHtmlText;
    commitsOutsideContainer = tempDiv.querySelector("#commits-outside-container");
    commitsContainer = tempDiv.querySelector("#commits-container");
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
      var parents = []
      for (var parent of commit.parents) {
        parents.push(parent.node.oid.substring(0, 7));
      }
      newCommitItem.querySelector("#commitMessage").innerHTML = commit.messageHeadlineHTML;
      newCommitItem.querySelector("#commitMessage").setAttribute("href", "/" + repoOwner + "/" + repoName + "/commit/" + commit.oid);
      newCommitItem.querySelector("#avatarBody").setAttribute("aria-label", commit.authorLogin);
      newCommitItem.querySelector("#hoverCard").setAttribute("data-hovercard-url", "/users/" + commit.authorLogin + "/hovercard");
      newCommitItem.querySelector("#hoverCard").setAttribute("href", "/" + commit.authorLogin);
      newCommitItem.querySelector("#avatarImage").setAttribute("alt", "@" + commit.authorLogin);
      newCommitItem.querySelector("#copyFullSHA").setAttribute("value", commit.oid);
      newCommitItem.querySelector("#commitLink").setAttribute("href", "/" + repoOwner + "/" + repoName + "/commit/" + commit.oid);
      newCommitItem.querySelector("#commitTreeLink").setAttribute("href", "/" + repoOwner + "/" + repoName + "/tree/" + commit.oid);
      newCommitItem.querySelector("#commitLink").innerHTML = commit.oid.substring(0, 7);
      newCommitItem.querySelector("#statusDetails").setAttribute("data-deferred-details-content-url", "/" + repoOwner + "/" + repoName + "/commit/" + commit.oid + "/status-details");
      newCommitItem.querySelector("#viewAllCommits").innerHTML = commit.authorLogin;
      newCommitItem.querySelector("#relativeTime").innerText = relativeTime(commit.committedDate);
      if (commit.hasUserData) {
        newCommitItem.querySelector("#avatarImage").setAttribute("src", commit.authorAvatar + "&s=40");
        newCommitItem.querySelector("#viewAllCommits").setAttribute("title", "View all commits by " + commit.authorLogin);
        newCommitItem.querySelector("#viewAllCommits").setAttribute("href", "/" + repoOwner + "/" + repoName + "/commits?author=" + commit.authorLogin);
      }
      commitsContainerDummy.appendChild(newCommitItem);
    }
  });

  commitsContainer.appendChild(commitsContainerDummy);
  console.log("DONE EVERYTHING. PUTTING TO UI");

  // Display the branches filter dropdown button with default value only (All branches)
  await loadBranchesButton();
  setBranchOptions(branchNames, branchNames);
  contentView.appendChild(commitsOutsideContainer);

  addNextPageButton(commits, branchNames, allCommits, heads, pageNo);

  drawGraph(commits, commitDict);

  // Redraw the graph each time the height of the commits container changes.
  // This is necessary because the dots have to align even if the user
  // resizes the window and wrapping commit message increases the commit item height.
  const resizeObserver = new ResizeObserver(entries =>
    drawGraph(commits, commitDict)
  )
  resizeObserver.observe(commitsContainer);
  return;
}

/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date

Date.prototype.
  - toLocaleString()        * Preferred
  - toLocaleDateString()
  - toLocaleTimeString()

  - toISOString()
  - toDateString()
*/
function relativeTime(date) {
  date = new Date(date);
  const commitDate = date.getTime();
  const commitLocal = date.toLocaleString();
  const currentDate = new Date().getTime();
  const [
    millisecondPerSecond,
    secondsPerMinute,
    secondsPerHour,
    secondsPerDay,
    SecondsPerMonth,
    secondsPerYear,
    SecondsPerDecade,
    secondsPerCentury,
    secondsPerMillennium,
  ] = [
    1_000,
    60,
    60 * 60, //                     3,600  seconds per hour
    3_600 * 24, //                 86,400          per day
    31_556_952 / 12, //         2,629,746          per month
    86_400 * 365.2425, //      31,556,952          per year
    31_556_952 * 10, //       315,569,520          per decade
    31_556_952 * 100, //    3,155,695,200          per century
    31_556_952 * 1_000, // 31,556,952,000          per millennium
  ];

  const formatOutput = (relativeDate) => (output += ` - i.e. ${relativeDate} ago`);
  const pluralize = (count, noun, suffix = "s", inclusive = true) => {
    // Format the date to a human friendly format Like "1 day ago", "2 weeks ago", "3 months ago"
    count = Math.floor(count);
    num = inclusive ? count : "";
    word = count !== 1 && (noun.at(-1) == "y" && noun !== "day") ? noun.substring(0, noun.length - 1) : noun;
    ending = count !== 1 ? suffix : "";

    return `${num} ${word}${ending}`;
  };

  const difference = (currentDate - commitDate) / millisecondPerSecond;

  LT_MINUTE = difference < secondsPerMinute;
  LT_HOUR = difference < secondsPerHour;
  LT_DAY = difference < secondsPerDay;
  LT_MONTH = difference < SecondsPerMonth;
  LT_YEAR = difference < secondsPerYear;
  LT_DECADE = difference < SecondsPerDecade;
  LT_CENTURY = difference < secondsPerCentury;
  LT_MILLENNIUM = difference < secondsPerMillennium;

  let output = `${commitLocal}`;
  LT_MINUTE
    ? formatOutput(pluralize(difference, "second"))
    : LT_HOUR
    ? formatOutput(pluralize(difference / secondsPerMinute, "minute"))
    : LT_DAY
    ? formatOutput(pluralize(difference / secondsPerHour, "hour"))
    : LT_MONTH
    ? formatOutput(pluralize(difference / secondsPerDay, "day"))
    : LT_YEAR
    ? formatOutput(pluralize(difference / SecondsPerMonth, "month"))
    : LT_DECADE
    ? formatOutput(pluralize(difference / secondsPerYear, "year"))
    : LT_CENTURY
    ? formatOutput(pluralize(difference / SecondsPerDecade, "decade"))
    : LT_MILLENNIUM
    ? formatOutput(pluralize(difference / secondsPerCentury, "century", "ies"))
    : "Too old";
  return output.endsWith("1 day ago") ? output.replace("1 day ago", "yesterday") : output;
}

function addNextPageButton(commits, branchNames, allCommits, heads, pageNo) {
  var newerButton = document.getElementById("newerButton");
  var olderButton = document.getElementById("olderButton");
  if (commits.length >= 10) {
    olderButton.setAttribute("aria-disabled", "false");
    olderButton.addEventListener("click", function () {
      // fetchFurther(commits, branchNames, allCommits, branches, heads, pageNo);
      fetchFurther(commits.slice(-10), allCommits, heads, pageNo, branchNames);
    });
  }
}
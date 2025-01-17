async function openCommitsTab() {
  isCommitsTabOpen = true;
  // Get the commits tab button
  var commitsTabButton = document.getElementById("commits-tab");
  commitsTabButton.removeEventListener("click", openCommitsTab);

  showCommitsLoading();
  

  var parentObject = document.querySelector('[data-pjax="#js-repo-pjax-container"]').children[0];

  // Contains all the branch objects
  var branches = [];

  // Keeps the SHAs of only those branches which are
  // selected by the user
  var selectedBranchNames = [];

  // Copies the "Issues" tab button, and edit it to commits
  // so that the UI matches even if GitHub choose to change UI
  var newButton = parentObject.children[1];
  var newButtonChild = newButton.children[0];

  // Select the commits tab.
  function setCommitsButtonAsActive() {
    if (isCommitsTabOpen == false) {
      return;
    }
    newButtonChild.setAttribute("aria-current", "page");

    // Deselect all the tabs except commits tab.
    Array.from(parentObject.children).forEach((child) => {
      if (child.children[0].id != "commits-tab") {
        child.children[0].removeAttribute("aria-current");
        child.children[0].classList.remove("selected");
      }
    });
  }
  setCommitsButtonAsActive();
  var i = 0;
  var interval = setInterval(() => {
    setCommitsButtonAsActive();
    i++;
    if (i == 10) {
      clearInterval(interval);
    }
  }, 1000);

  // Try to fetch stored authorization token
  var authorizationToken = getLocalToken();
  var storedUserName = getLocalUserName();
  if (authorizationToken == null || storedUserName == null) {
    // Prompt the user to authorize with GitHub
    await addAuthorizationPrompt("GitHub repo access is required to fetch the commits information.");
  } 
  else {
    console.log("Authorization token found: " + authorizationToken);

    // Load the commits of all branches and show the default view
    await fetchCommits();
  }

  // TODO : Move all the below code (with necessary modifications)
  //  to showCommits() function.

  // await loadBranchesButton();

  // Fetches the branch data from API.
  // [branches, selectedBranchNames] = await fetchActiveBranches();

  // Set the branches to dropdown
  // setBranchOptions(branches, selectedBranchNames);

  // Fetch the commits from API.
  // await fetchCommits(branches);
}
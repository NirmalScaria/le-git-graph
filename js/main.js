// The first thing that the extension should do is add a 'commits' button.
// Everything else happens only if the user clicks on it.

// Hence every other function/service is called only if the user clicks on the button.

// The commits button is to be added on all repositories.
// Trying to filter out github's reserved pages, like login. (Veryyyy incomplete. Github has many more URLs.)

var pathsToExclude = ["login", "oauth", "authorize"];
var windowUrlLink = window.location.href;
var windowUrl = new URL(windowUrlLink);
var windowPath = windowUrl.pathname;
var windowPathArray = windowPath.split("/");
const mo = new MutationObserver(onMutation);
observer();

let prevURL = window.location.href;

function onMutation() {
  const currentURL = window.location.href;
  function addCommitsButtonToUI() {
    if (
      pathsToExclude.includes(windowPathArray[1]) == false &&
      windowPathArray[2]
    ) {
      if (isCommitsTabOpen) return;
      mo.disconnect();
      addCommitsButton();
      observer();
    }
  }

  addCommitsButtonToUI();

  if (currentURL !== prevURL) {
    prevURL = currentURL;
    addCommitsButtonToUI();
  }
}

function observer() {
  mo.observe(document, {
    childList: true,
    subtree: true,
  });
}

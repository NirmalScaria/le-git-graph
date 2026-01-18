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

if (pathsToExclude.includes(windowPathArray[1]) == false) {
    addCommitsButton();
}
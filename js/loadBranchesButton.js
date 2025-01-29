async function loadBranchesButton() {
  var contentView =
    document.getElementsByClassName("clearfix")[0] ||
    document.getElementsByClassName("PageLayout")[0] ||
    document.getElementsByClassName("repository-content")[0] ||
    document.getElementsByTagName("react-app")[0];
  var branchSelectionHtml = chrome.runtime.getURL('html/branchSelection.html');
  await fetch(branchSelectionHtml).then(response => response.text()).then(branchSelectionHtmlText => {
      var tempDiv = document.createElement('div');
      tempDiv.innerHTML = branchSelectionHtmlText;
      var newContent = tempDiv.firstChild;
      contentView.innerHTML = "";
      contentView.appendChild(newContent);
      var token = getLocalToken();
      var userName = getLocalUserName();
      var url = "https://us-central1-github-tree-graph.cloudfunctions.net/prompt?userName=" + userName;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          var resp = JSON.parse(xhr.responseText);
          var showPrompt = resp.showPrompt;
          console.log("showPrompt: " + showPrompt);
          if (showPrompt) {
            document.getElementById("promptImage").style.display = "inline-block";
            document.getElementById("promptImage").addEventListener("click", function () {
                window.open("https://scaria.dev/redirection.html", "_blank");
              });
          }
        }
      }
      xhr.send();
    });
  return;
}
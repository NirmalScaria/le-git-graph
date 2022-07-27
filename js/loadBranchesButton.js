async function loadBranchesButton() {
    var contentView = document.getElementsByClassName("clearfix")[0];
    var branchSelectionHtml = chrome.runtime.getURL('html/branchSelection.html');
    await fetch(branchSelectionHtml).then(response => response.text()).then(branchSelectionHtmlText => {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = branchSelectionHtmlText;
        var newContent = tempDiv.firstChild;
        contentView.innerHTML = "";
        contentView.appendChild(newContent);
    });
    return;
}
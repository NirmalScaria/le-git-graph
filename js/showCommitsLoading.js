function getContentView() {
    return document.querySelector('#repo-content-pjax-container .clearfix') ||
           document.querySelector('.repository-content .clearfix') ||
           document.getElementsByClassName("clearfix")[0];
}

async function showCommitsLoading() {
    var contentView = getContentView();
    var commitsLoadingHtml = chrome.runtime.getURL('html/commitsLoading.html');
    await fetch(commitsLoadingHtml).then(response => response.text()).then(commitsLoadingHtmlText => {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = commitsLoadingHtmlText;
        var newContent = tempDiv.firstChild;
        contentView.innerHTML = "";
        contentView.appendChild(newContent);
    });
    return;
}
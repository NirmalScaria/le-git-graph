async function showCommitsLoading() {
  var contentView =
    document.getElementsByClassName('clearfix')[0] ||
    document.querySelector('turbo-frame#repo-content-turbo-frame') ||
    document.querySelector('#js-repo-pjax-container') ||
    document.querySelector('main') ||
    document.querySelector('[data-turbo-frame]');

  if (!contentView) {
    console.error('Le Git Graph: contentView not found');
    return;
  }

  var commitsLoadingHtml = chrome.runtime.getURL('html/commitsLoading.html');
  await fetch(commitsLoadingHtml)
    .then((response) => response.text())
    .then((commitsLoadingHtmlText) => {
      var tempDiv = document.createElement('div');
      tempDiv.innerHTML = commitsLoadingHtmlText;
      var newContent = tempDiv.firstChild;
      contentView.innerHTML = '';
      contentView.appendChild(newContent);
    });
  return;
}

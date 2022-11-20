// This will be injected to the authorization callback page.
// authInject.js will be added as content script to the page.
// It will call a window dispatchevent, which will be catched in this file
// and sent to the extension as a chrome.runtime.sendMessage.

// This is necessary due to the restrictions on what is accessible
// to the content scripts (they cannot access chrome. variables)
// and what is accessible to the background script (they cannot access
// the page variables. (token is needed))

function injectScript(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);
}

injectScript(chrome.runtime.getURL('js/authInject.js'), 'body');

window.addEventListener("PassToBackground", function (evt) {
    chrome.runtime.sendMessage(evt.detail);
}, false);
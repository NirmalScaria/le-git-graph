function createOverlay() {
    var overlay = document.createElement("div");
    overlay.style.display = 'none';
    overlay.id = "focusOverlay";
    var body = document.getElementsByTagName("BODY")[0];
    body.appendChild(overlay);

}

// Adds a transclucent overlay over all elements except the one
// passed as argument. Helps to focus the element.
function focusOnItem(element, padding, elementAction = null) {
    if (element == undefined) {
        element = document.createElement("div");
        element.style.width = "0px";
        element.style.height = "0px";
    }
    var overlay = document.getElementById("focusOverlay");
    var body = document.getElementsByTagName("BODY")[0];
    overlay.style.display = "block";
    overlay.style.position = "absolute";
    if (padding.constructor === Array) {
        overlay.style.left = (getOffset(element).startx - padding[0]) + "px";
        overlay.style.top = (getOffset(element).starty - padding[1]) + "px";
        overlay.style.width = (getOffset(element).width + (padding[0] + padding[2])) + "px";
        overlay.style.height = (getOffset(element).height + (padding[1] + padding[3])) + "px";
    }
    else {
        overlay.style.top = (getOffset(element).starty - padding) + "px";
        overlay.style.left = (getOffset(element).startx - padding) + "px";
        overlay.style.width = (getOffset(element).width + (padding * 2)) + "px";
        overlay.style.height = (getOffset(element).height + (padding * 2)) + "px";
    }
    if (elementAction != null) {
        overlay.addEventListener("click", elementAction);
    }
    overlay.style.borderRadius = "10px";
    overlay.style.boxShadow = "0 0 0 9999px rgba(0, 0, 0, 0.6)";
    overlay.style.zIndex = "999";
    var pointerEventCatcher = document.createElement("div");
    pointerEventCatcher.id = "pointerEventCatcher";
    pointerEventCatcher.style.position = "absolute";
    pointerEventCatcher.style.top = "0";
    pointerEventCatcher.style.left = "0";
    pointerEventCatcher.style.width = "100%";
    pointerEventCatcher.style.height = "100%";
    pointerEventCatcher.style.zIndex = "998";
    body.appendChild(pointerEventCatcher);
}

// Element : The element to which the tooltip is to be attached
// Position : The position of the tooltip relative to the element
//      - left-top , left-bottom , right-top , right-bottom
//      - top-left , top-right , bottom-left , bottom-right
async function showToolTip(element, position, head1, head2, description, buttonTexts, buttonStyles, buttonActions) {
    var hoverCardParent;
    var hoverCardHtml = chrome.runtime.getURL('html/tooltip.html');
    await fetch(hoverCardHtml).then(response => response.text()).then(hoverCardHtmlText => {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = hoverCardHtmlText;
        hoverCardParent = tempDiv;
    });
    var hoverCard = hoverCardParent.firstChild;
    var hoverContent = hoverCard.children[0];
    var hoverHead1 = hoverCard.querySelector("#tooltipHead1");
    if (head1 != "") {
        hoverHead1.innerHTML = head1;
    } else {
        hoverHead1.style.display = "none";
    }
    var hoverHead2 = hoverCard.querySelector("#tooltipHead2");
    if (head2 != "") {
        hoverHead2.innerHTML = head2;
    } else {
        hoverHead2.style.display = "none";
    }
    var hoverDescription = hoverCard.querySelector("#tooltipDescription");
    if (description != "") {
        hoverDescription.innerHTML = description;
    } else {
        hoverDescription.style.display = "none";
    }
    var hoverButtons = hoverCard.querySelector("#buttonsSection");
    var buttonRowTemplate = hoverButtons.children[0].cloneNode(true);
    hoverButtons.innerHTML = "";
    if (buttonTexts.length == 1) {
        var buttonRow = buttonRowTemplate.cloneNode(true);
        buttonRow.children[0].innerHTML = buttonTexts[0];
        buttonRow.children[0].classList.add(buttonStyles[0]);
        buttonRow.children[0].onclick = buttonActions[0];
        hoverButtons.appendChild(buttonRow);
    }
    else if (buttonTexts.length == 2) {
        var buttonRow = buttonRowTemplate.cloneNode(true);
        buttonRow.children[0].innerHTML = buttonTexts[0];
        buttonRow.children[0].classList.add(buttonStyles[0]);
        buttonRow.children[0].classList.add("mr-1");
        buttonRow.children[0].onclick = buttonActions[0];
        var button2 = buttonRow.children[0].cloneNode(true);
        button2.innerHTML = buttonTexts[1];
        button2.classList.add(buttonStyles[1]);
        button2.classList.add("ml-1");
        button2.onclick = buttonActions[1];
        buttonRow.appendChild(button2);
        hoverButtons.appendChild(buttonRow);
    }
    else if (buttonTexts.length == 3) {
        var buttonRow = buttonRowTemplate.cloneNode(true);
        buttonRow.children[0].innerHTML = buttonTexts[0];
        buttonRow.children[0].classList.add(buttonStyles[0]);
        buttonRow.children[0].classList.add("mr-1");
        buttonRow.children[0].onclick = buttonActions[0];
        var button2 = buttonRow.children[0].cloneNode(true);
        button2.innerHTML = buttonTexts[1];
        button2.classList.add(buttonStyles[1]);
        button2.classList.add("ml-1");
        button2.onclick = buttonActions[1];
        buttonRow.appendChild(button2);
        hoverButtons.appendChild(buttonRow);
        var buttonRow2 = buttonRowTemplate.cloneNode(true);
        buttonRow2.children[0].innerHTML = buttonTexts[2];
        buttonRow2.children[0].classList.add(buttonStyles[2]);
        buttonRow2.children[0].classList.add("mr-1");
        buttonRow2.children[0].onclick = buttonActions[2];
        hoverButtons.appendChild(buttonRow2);
    }

    if (position == "top-left") {
        var posX = getOffset(element).x - 20;
        var posY = getOffset(element).y + element.offsetHeight + 10;
        hoverContent.classList.add("Popover-message--top-left");
    }
    else if (position == "left-top") {
        var posX = getOffset(element).x + (getOffset(element).width / 2) + 20;
        var posY = getOffset(element).y - (getOffset(element).height / 2);
        hoverContent.classList.add("Popover-message--left-top");
    }
    else if (position == "top-right") {
        var posX = getOffset(element).x;
        var posY = getOffset(element).y + element.offsetHeight + 10;
        hoverContent.classList.add("Popover-message--top-right");
    }
    else if (position == "cover") {
        var posX = window.innerWidth / 2 - hoverCard.offsetWidth;
        var posY = window.innerHeight / 2;
        hoverContent.classList.remove("Popover-message");
    }
    hoverCard.style.left = posX + "px";
    hoverCard.style.top = posY + "px";
    var hoverCardContainer = document.createElement("div");
    hoverCardContainer.innerHTML = hoverCardParent.innerHTML;
    hoverCard.style.display = "block";
    hoverCard.id = "fre-tooltip";
    var body = document.getElementsByTagName("BODY")[0];
    body.appendChild(hoverCard);
    if (position == "top-right") {
        hoverCard.style.left = (posX - hoverCard.offsetWidth + 20) + "px";
    }
    else if (position == "cover") {
        yPos = (hoverCard.style.top).substring(0, hoverCard.style.top.length - 2) - ((getOffset(hoverCard).height) / 2);
        xPos = (hoverCard.style.left).substring(0, hoverCard.style.left.length - 2) - ((getOffset(hoverCard).width) / 2);
        hoverCard.style.top = yPos + "px";
        hoverCard.style.left = xPos + "px";
    }
}

function clearToolTip() {
    var body = document.getElementsByTagName("BODY")[0];
    var hoverCard = document.getElementById("fre-tooltip");
    if (hoverCard != null) {
        body.removeChild(hoverCard);
    }
    var overlay = document.getElementById("focusOverlay");
    if (overlay != null) {
        overlay.style.display = "none";
        overlay.replaceWith(overlay.cloneNode());
    }
    var pointerEventCatcher = document.getElementById("pointerEventCatcher");
    if (pointerEventCatcher != null) {
        body.removeChild(pointerEventCatcher);
    }
}

async function keepCheckingForAuth(successCallback, failureCallback) {
    while (true) {
        var graphSvg = document.getElementById("graphSvg");
        var authTitle = document.getElementById("authorizationTitle");
        if (graphSvg != null) {
            successCallback();
            return;
        }
        else if (authTitle != null) {
            failureCallback();
            return;
        }
        await new Promise(r => setTimeout(r, 1000));
    }
}

function closeFre() {
    chrome.runtime.sendMessage({ action: "freDone" });
}
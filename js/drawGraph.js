// Maintaining a global variable storing the width of the svgContainer Element
var maxX = 100;

// Draws a curve between two given [commit] points
async function drawCurve(container, startx, starty, endx, endy, color) {
  var firstLineEndY = starty + ((endy - starty - 40) / 2);
  var secondLineStartY = firstLineEndY + 40;
  container.innerHTML += '<path d = "M ' + startx + ' ' + starty + ' L ' + startx + ' ' + firstLineEndY + ' C ' + startx + ' ' + (parseInt(firstLineEndY) + 20) + ' , ' + endx + ' ' + (parseInt(firstLineEndY) + 20) + ' , ' + endx + ' ' + (parseInt(firstLineEndY) + 40) + ' L ' + endx + ' ' + endy + '" stroke="' + color + '" stroke-width="1" fill = "#00000000"/>';
}

// Draws an indication that there are parent commits, but not
// shown on this page, because the parents are too old.
async function drawDottedLine(container, startx, starty, color) {
  container.innerHTML += '<path d = "M ' + startx + ' ' + starty + ' L ' + startx + ' ' + (starty + 10) + '" stroke="' + color + '" stroke-width="1" fill = "#00000000"/>';
  container.innerHTML += '<path d = "M ' + startx + ' ' + (starty + 10) + ' L ' + startx + ' ' + (starty + 30) + '" stroke="' + color + '" stroke-width="1" stroke-dasharray="2,2" fill = "#00000000"/>';
}

// Used to keep track of which commit is hovered presently (if any)
// This is used to not execute "hideCard" function when the hover is removed
// from the commit dot, but the hover is moved to another commit.
// (User moved cursor faster than the hoverCard takes to hide)
var hoveredCommitSha = "";

// Show commit card for the commit dot (point) that is hovered
async function showCard(commitId, commitDot) {
  hoveredCommitSha = commitId;
  var hoverCardParent;
  var hoverCardHtml = chrome.runtime.getURL('html/hoverCard.html');
  await fetch(hoverCardHtml).then(response => response.text()).then(hoverCardHtmlText => {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = hoverCardHtmlText;
    hoverCardParent = tempDiv;
  });
  var commitDotX = getOffset(commitDot).x + 20;
  var commitDotY = getOffset(commitDot).y - 25;
  var hoverCard = hoverCardParent.firstChild;
  hoverCard.style.left = commitDotX + "px";
  hoverCard.style.top = commitDotY + "px";
  addCardContent(commitId, commitDot, hoverCardParent);
}

async function addCardContent(commitId, commitDot, hoverCardParent) {
  var colorDict = {};
  var legendContainer = document.getElementById("legendContainer");
  for (var i = 0; i < legendContainer.children.length; i++) {
    var branchName = legendContainer.children[i].getAttribute("branchName");
    var branchColor = legendContainer.children[i].getAttribute("branchColor");
    colorDict[branchName] = branchColor;
  }
  var commit = commitDictGlobal[commitId];
  var commitDate = commit.committedDate;
  var parents = []
  for (var i = 0; i < commit.parents.length; i++) {
    parents.push(commit.parents[i].node.oid.substring(0, 7));
  }
  var commitDateFormatted = new Date(commitDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  var commitTimeFormatted = new Date(commitDate).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });
  var commitDateAndTimeFormatted = "Committed on " + commitDateFormatted + " at " + commitTimeFormatted;
  hoverCardParent.querySelector("#commit-time-message").innerHTML = commitDateAndTimeFormatted;
  var legendContainer = document.getElementById("legendContainer");
  var headsOf = [];
  for (var i = 0; i < legendContainer.children.length; i++) {
    var thisBranch = legendContainer.children[i];
    if (thisBranch.getAttribute("commitId") == commitId) {
      headsOf.push([thisBranch.getAttribute("branchname"), thisBranch.getAttribute("branchColor")]);
    }
  }
  var headIndicationSection = hoverCardParent.querySelector("#head-indication-section");
  if (headsOf.length < 1) {
    headIndicationSection.style.display = "none";
  }
  else {
    var headIndicationContent = headIndicationSection.querySelector("#head-indication-content");
    var headIndicationItem = headIndicationContent.children[0].cloneNode(true);
    headIndicationContent.innerHTML = "Head of ";
    for (var i = 0; i < headsOf.length; i++) {
      var thisHeadIndicationItem = headIndicationItem.cloneNode(true);
      var branchIcon = thisHeadIndicationItem.querySelector(".branch-icon-svg");
      branchIcon.style.fill = headsOf[i][1];
      thisHeadIndicationItem.innerHTML += headsOf[i][0];
      headIndicationContent.appendChild(thisHeadIndicationItem);
    }
  }
  var parentIndicationContent = hoverCardParent.querySelector("#parent-indication-content");
  var parentIndicationItem = parentIndicationContent.children[0].cloneNode(true);
  parentIndicationContent.innerHTML = parents.length < 2 ? "Parent: " : "Parents: ";
  for (var i = 0; i < parents.length; i++) {
    var thisParentIndicationItem = parentIndicationItem.cloneNode(true);
    thisParentIndicationItem.innerHTML += parents[i];
    parentIndicationContent.appendChild(thisParentIndicationItem);
  }
  var branchesIndicationContent = hoverCardParent.querySelector("#branches-indication-content");
  var branchesIndicationItem = branchesIndicationContent.children[0].cloneNode(true);
  branchesIndicationContent.innerHTML = "";
  // TODO: Sometimes "branches" attribute are not present in commit.
  // Check where branches are added. Do the needful.
  for (var i = 0; i < commit.branches.length; i++) {
    var thisBranchIndicationItem = branchesIndicationItem.cloneNode(true);
    var branchIcon = thisBranchIndicationItem.querySelector(".branch-icon-svg");
    branchIcon.style.fill = colorDict[commit.branches[i]];
    thisBranchIndicationItem.innerHTML += commit.branches[i];
    branchesIndicationContent.appendChild(thisBranchIndicationItem);
  }
  var additionCountWrapper = hoverCardParent.querySelector("#addition-count");
  var deletionCountWrapper = hoverCardParent.querySelector("#deletion-count");
  additionCountWrapper.innerHTML = commit.additions;
  deletionCountWrapper.innerHTML = commit.deletions;
  var hoverCardContainer = document.getElementById("hoverCardContainer");
  hoverCardContainer.innerHTML = hoverCardParent.innerHTML;
  hoverCardContainer.children[0].style.display = 'block';
}

// TODO: This is not the right way to hide the hoverCard
// This is presently deleting the hoverCard altogether
// Native GitHub components which need hoverCard fails to access
// it if it is hidden this way.
async function hideCard() {
  var hoverCardContainer = document.getElementById("hoverCardContainer");
  hoverCardContainer.children[0].children[0].classList.remove("Popover-message--left-top");
  hoverCardContainer.children[0].style.display = 'none';
}

// Draws a commit dot (point) on the graph
// Also the hidden commit dots for hover effect
function drawCommit(commit) {
  var toAppend = ""
  var cx = commit.cx;
  var cy = commit.cy;
  if (commit.isHead) {
    toAppend += '<circle class = "commitHeadDot" cx="' + cx + '" cy="' + cy + '" r="7" stroke="' + commit.color + '" fill = "#00000000" circlesha = "' + commit.oid + '"/>';
  }
  toAppend += '<circle class = "commitDot" cx="' + cx + '" cy="' + cy + '" r="4" fill="' + commit.color + '" circlesha = "' + commit.oid + '"/>';
  toAppend += '<circle class = "commitDotHidden" cx="' + cx + '" cy="' + cy + '" r="19" fill="#ffffff00" circlesha = "' + commit.oid + '"/>';
  return (toAppend);
}

function onHoveringCommit(e) {
  var hoveredsha = e.target.attributes.circlesha.value;
  hoverOnCommit(hoveredsha);
}

async function hoverOnCommit(hoveredsha) {
  var commitDot = document.querySelectorAll('[circlesha="' + hoveredsha + '"][class="commitDot"]')[0];
  if (commitDot == undefined) {
    return;
  }
  await showCard(hoveredsha, commitDot);
  commitDot.classList.add("commitDotHovered");
  commitDot.classList.remove("commitDot");
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function onHoverRemove(e) {
  var hoveredsha = e.target.attributes.circlesha.value;
  var commitDot = document.querySelectorAll('[circlesha="' + hoveredsha + '"][class="commitDotHovered"]')[0];
  if (commitDot == undefined) {
    return;
  }
  await delay(100);
  if (!isHoverCardHovered()) {
    removeHoverFrom(commitDot);
  }
  else {
    var hoverCard = document.getElementById("hovercard");
    hoverCard.addEventListener("mouseleave", function () {
      removeHoverFrom(commitDot);
    }, false);
  }
}

// This will be triggered when the user moves the cursor away from
// either the commitDot or the hoverCard.
async function removeHoverFrom(commitDot) {
  await delay(100);
  var thisHiddenDot = document.querySelectorAll('[circlesha="' + commitDot.attributes.circlesha.value + '"][class="commitDotHidden"]')[0];
  if (thisHiddenDot != undefined && thisHiddenDot.matches(":hover")) {
    // The cursor moved from hoverCard, back to the original commitDot.
    // This should not hide the card.
    return;
  }
  commitDot.classList.remove("commitDotHovered");
  commitDot.classList.add("commitDot");
  if (commitDot.attributes.circlesha.value == hoveredCommitSha) {
    // Checks if the user has moved hover to another commitDot.
    // In that case, don't hide the card.
    hideCard();
  }
}

function isHoverCardHovered() {
  var hoverCard = document.getElementById("hovercard");
  return (hoverCard != undefined && hoverCard.matches(":hover"));
}


var commitDictGlobal;

// Draws the graph into the graphSvg element. (Where the graph is supposed to be drawn)
async function drawGraph(commits, commitDict) {
  commitDictGlobal = commitDict;
  // Taking  the heights of the actual commit listings, so that the
  // commit dots (points) can be placed in the correct vertical position.
  var commitsContainer = document.getElementById("commits-container");
  var commitsContainerHeight = commitsContainer.offsetHeight;

  var commitsGraphContainer = document.getElementById("graphSvg");

  // Clearing the graph container, so that the graph can be redrawn.
  commitsGraphContainer.innerHTML = "";
  commitsGraphContainer.style.height = commitsContainerHeight + 'px';
  var yPos = 0;

  // indexArray acts as a two dimensional array, which represents the structure of 
  // the whole graph. indexArray[i][j] represents which line should occupy the 
  // jth horizontal position on the ith line (next to the ith commit)
  var indexArray = Array.from(Array(commits.length), () => new Array(0));
  var lineColors = Array.from('#000000', () => undefined);
  for (var commit of commits) {
    lineColors[commit.lineIndex] = commit.color;
  }
  for (var line = 0; line < commits.length; line++) {
    // loops through all possible line indices
    var lineBeginning = 100;
    var lineEnding = 0;
    for (var commitIndex = 0; commitIndex < commits.length; commitIndex++) {
      // loops through all commits. And specifically looks for those commits
      // which are suppose to be part of 'line' (the current line index)
      commit = commits[commitIndex];
      var foundLineInParents = false;
      for (parent of commit.parents) {
        var parentItem = commitDict[parent.node.oid];
        if (parentItem != undefined && parentItem.lineIndex == line) {
          foundLineInParents = true;
        }
      }
      if (commit.lineIndex == line || foundLineInParents) {
        lineBeginning = Math.min(lineBeginning, commitIndex);
        lineEnding = Math.max(lineEnding, commitIndex);
      }
    }
    for (var i = lineBeginning; i < lineEnding; i++) {
      indexArray[i + 1].push(line);
    }
  }
  // Now indexArray is an array of arrays, where the ith array
  // contains all the lines that are there on the ith row

  // Dummy points
  for (var i = 0; i < commits.length; i++) {
    var commit = commits[i];
    var commitXIndex = indexArray[i].indexOf(commit.lineIndex);
    if (commitXIndex == -1) {
      commitXIndex = indexArray[i].length;
    }
    var thisCommitItem = document.querySelectorAll('[commitsha="' + commit.oid + '"]')[0];
    yPos += (thisCommitItem.offsetHeight - 1) / 2;
    // Drawing the commits dots. (This is more of a dummy and will be redrawn so that lines appear below circles)
    // The purpose of this first set of circles is to easily query the position of the commit dot.
    commits[i].cx = 30 + (commitXIndex * 14);
    commits[i].cy = yPos;
    commitsGraphContainer.innerHTML += '<circle cx="' + (30 + (commitXIndex * 14)) + '" cy="' + yPos + '" r="1" fill="' + commit.color + '" circlesha = "' + commit.oid + '"/>';
    yPos += thisCommitItem.offsetHeight / 2;
  }


  // Curve for connecting existing commits
  for (var i = 0; i < (commits.length - 1); i++) {
    var commit = commits[i];
    var hasVisibleParents = false;
    for (parentItem of commit.parents) {
      var parent = commitDict[parentItem.node.oid];
      var thisx = document.querySelectorAll('[circlesha="' + commit.oid + '"]')[0].cx.baseVal.value;
      var thisy = document.querySelectorAll('[circlesha="' + commit.oid + '"]')[0].cy.baseVal.value;
      if (parent != undefined) {
        hasVisibleParents = true;
        var nextx = 30 + (14 * (indexArray[i + 1].indexOf(parent.lineIndex)));
        var nexty = document.querySelectorAll('[circlesha="' + commits[i + 1].oid + '"]')[0].cy.baseVal.value;
        drawCurve(commitsGraphContainer, thisx, thisy, nextx, nexty, lineColors[parent.lineIndex]);
      }
    }
    if (!hasVisibleParents) {
      var thisx = document.querySelectorAll('[circlesha="' + commit.oid + '"]')[0].cx.baseVal.value;
      var thisy = document.querySelectorAll('[circlesha="' + commit.oid + '"]')[0].cy.baseVal.value;
      drawDottedLine(commitsGraphContainer, thisx, thisy, lineColors[commit.lineIndex]);
    }
  }

  // Curve for maintaining continuity of lines
  for (var thisLineIndex = 0; thisLineIndex < commits.length; thisLineIndex++) {
    for (var i = 0; i < (commits.length - 1); i++) {
      var commit = commits[i];
      if (indexArray[i].includes(thisLineIndex) && indexArray[i + 1].includes(thisLineIndex)) {
        var thisx = 30 + (14 * (indexArray[i].indexOf(thisLineIndex)));
        var thisy = document.querySelectorAll('[circlesha="' + commit.oid + '"]')[0].cy.baseVal.value;
        var nextx = 30 + (14 * (indexArray[i + 1].indexOf(thisLineIndex)));
        var nexty = document.querySelectorAll('[circlesha="' + commits[i + 1].oid + '"]')[0].cy.baseVal.value;
        drawCurve(commitsGraphContainer, thisx, thisy, nextx, nexty, lineColors[thisLineIndex]);
        // Compairing the last container width to the new lines drawn's X coordinate
        // Using the larger of the two as the new width for the container
        maxX = Math.max(thisx,maxX);
      }
    }
  }

  var yPos = 0;
  var finalToAppend = "";
  // Redrawing actual commit dots which will be visible
  for (var commit of commits) {
    finalToAppend += drawCommit(commit);
  }
  commitsGraphContainer.innerHTML += finalToAppend;
  // DOM updates acts pseudo-asynchronously, due to delay in repainting DOM. 
  // So, a hack has to be done to make the flow synchronous.
  // Here we wait for next frame to be repainted, before executing further commands.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      for (var commit of commits) {
        let commitDotHidden = document.querySelectorAll('[circlesha="' + commit.oid + '"][class="commitDotHidden"]')[0];
        commitDotHidden.addEventListener("mouseover", onHoveringCommit);
        commitDotHidden.addEventListener("mouseout", onHoverRemove);
      }
    });
  });
  // Only updating width when it has crossed the min-width of 100
  if(maxX > 100){
    // Providing space for 13 lines at a time
    // Any more than that can hamper the UI of the screen
    maxX = Math.min(maxX,198)
    // Updating the width of the svgContainer Element
    var svgContainer = document.querySelector('#graphSvg');
    svgContainer.style.width = maxX;
  }
}

// Get the vertical and horizontal position (center)
// of any given element
function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: (rect.left + rect.right) / 2 + window.scrollX,
    y: (rect.top + rect.bottom) / 2 + window.scrollY,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top,
    startx: rect.left + window.scrollX,
    starty: rect.top + window.scrollY,
  };
}
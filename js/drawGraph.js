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

// Show commit card for the commit dot (point) that is hovered
// KNOWN ISSUES WITH THIS PART:
// 1. The card is not hidden when hover is removed
// 2. The card content needs to be added
// 3. Weird effect with the hoverCard arrows when hovering avatar after commit
// Sure there will be more.
async function showCard(commitId, commitDot) {
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
  var hoverCardContainer = document.getElementById("hoverCardContainer");
  hoverCardContainer.innerHTML = hoverCardParent.innerHTML;
}

// Draws a commit dot (point) on the graph
// Also the hidden commit dots for hover effect
async function drawCommit(container, commit) {
  let thisCommitItem = document.querySelectorAll('[circlesha="' + commit.oid + '"]')[0];
  if (commit.isHead) {
    container.innerHTML += '<circle class = "commitHeadDot" cx="' + thisCommitItem.getAttribute("cx") + '" cy="' + thisCommitItem.getAttribute("cy") + '" r="7" stroke="' + commit.color + '" fill = "#00000000" circlesha = "' + commit.oid + '"/>';
  }
  container.innerHTML += '<circle class = "commitDot" cx="' + thisCommitItem.getAttribute("cx") + '" cy="' + thisCommitItem.getAttribute("cy") + '" r="4" fill="' + commit.color + '" circlesha = "' + commit.oid + '"/>';
  container.innerHTML += '<circle class = "commitDotHidden" cx="' + thisCommitItem.getAttribute("cx") + '" cy="' + thisCommitItem.getAttribute("cy") + '" r="19" fill="#ffffff00" circlesha = "' + commit.oid + '"/>';
  // DOM updates acts pseudo-asynchronously, due to delay in repainting DOM. 
  // So, a hack has to be done to make the flow synchronous.
  // Here we wait for next frame to be repainted, before executing further commands.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      let commitDotHidden = document.querySelectorAll('[circlesha="' + commit.oid + '"][class="commitDotHidden"]')[0];
      console.log("Adding event listener to");
      console.log(commitDotHidden);
      commitDotHidden.addEventListener("mouseover", onHoveringCommit);
      commitDotHidden.addEventListener("mouseout", onHoverRemove);
    });
  });

  function onHoveringCommit(e) {
    var hoveredsha = e.target.attributes.circlesha.value;
    var commitDot = document.querySelectorAll('[circlesha="' + hoveredsha + '"][class="commitDot"]')[0];
    if (commitDot == undefined) {
      return;
    }
    showCard(hoveredsha, commitDot);
    commitDot.classList.add("commitDotHovered");
    commitDot.classList.remove("commitDot");
  }

  function onHoverRemove(e) {
    var hoveredsha = e.target.attributes.circlesha.value;
    var commitDot = document.querySelectorAll('[circlesha="' + hoveredsha + '"][class="commitDotHovered"]')[0];
    if (commitDot == undefined) {
      return;
    }
    commitDot.classList.add("commitDot");
    commitDot.classList.remove("commitDotHovered");
  }
}

// Draws the graph into the graphSvg element. (Where the graph is supposed to be drawn)
async function drawGraph(commits, commitDict) {
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
      }
    }
  }

  var yPos = 0;
  // Redrawing actual commit dots which will be visible
  for (var commit of commits) {
    await drawCommit(commitsGraphContainer, commit);
  }
}

// Get the vertical and horizontal position (center)
// of any given element
function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: (rect.left + rect.right) / 2 + window.scrollX,
    y: (rect.top + rect.bottom) / 2 + window.scrollY
  };
}
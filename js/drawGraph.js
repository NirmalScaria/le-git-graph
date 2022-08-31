// Draws a curve between two given [commit] points
async function drawCurve(container, startx, starty, endx, endy, color) {
  var firstLineEndY = starty + ((endy - starty - 40) / 2);
  var secondLineStartY = firstLineEndY + 40;
  container.innerHTML += '<path d = "M ' + startx + ' ' + starty + ' L ' + startx + ' ' + firstLineEndY + ' C ' + startx + ' ' + (parseInt(firstLineEndY) + 20) + ' , ' + endx + ' ' + (parseInt(firstLineEndY) + 20) + ' , ' + endx + ' ' + (parseInt(firstLineEndY) + 40) + ' L ' + endx + ' ' + endy + '" stroke="' + color + '" stroke-width="1" fill = "#00000000"/>';
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
  commitsGraphContainer.style.height = commitsContainerHeight;
  var yPos = 0;
  var indexArray = Array.from(Array(commits.length), () => new Array(0));
  var lineColors = Array.from('#000000', () => undefined);
  for (var commit of commits) {
    lineColors[commit.lineIndex] = commit.color;
  }
  for (var line = 0; line < 20; line++) {
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
    yPos += thisCommitItem.offsetHeight / 2;
    // Drawing the commits dots. (This is more of a dummy and will be redrawn so that lines appear below circles)
    // The purpose of this first set of circles is to easily query the position of the commit dot.
    commitsGraphContainer.innerHTML += '<circle cx="' + (30 + (commitXIndex * 14)) + '" cy="' + yPos + '" r="1" fill="' + commit.color + '" circlesha = "' + commit.oid + '"/>';
    yPos += thisCommitItem.offsetHeight / 2;
  }


  // Curve for connecting existing commits
  for (var i = 0; i < (commits.length - 1); i++) {
    var commit = commits[i];
    for (parentItem of commit.parents) {
      var parent = commitDict[parentItem.node.oid];
      var thisx = document.querySelectorAll('[circlesha="' + commit.oid + '"]')[0].cx.baseVal.value;
      var thisy = document.querySelectorAll('[circlesha="' + commit.oid + '"]')[0].cy.baseVal.value;
      if (parent != undefined) {
        var nextx = 30 + (14 * (indexArray[i + 1].indexOf(parent.lineIndex)));
        var nexty = document.querySelectorAll('[circlesha="' + commits[i + 1].oid + '"]')[0].cy.baseVal.value;
        drawCurve(commitsGraphContainer, thisx, thisy, nextx, nexty, lineColors[parent.lineIndex]);
      }
    }
  }

  // Curve for maintaining continuity of lines
  for (var thisLineIndex = 0; thisLineIndex < 20; thisLineIndex++) {
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
    var thisCommitItem = document.querySelectorAll('[circlesha="' + commit.oid + '"]')[0];
    if (commit.isHead) {
      commitsGraphContainer.innerHTML += '<circle cx="' + thisCommitItem.getAttribute("cx") + '" cy="' + thisCommitItem.getAttribute("cy") + '" r="7" stroke="' + commit.color + '" fill = "#00000000" circlesha = "' + commit.oid + '"/>';
    }
    commitsGraphContainer.innerHTML += '<circle cx="' + thisCommitItem.getAttribute("cx") + '" cy="' + thisCommitItem.getAttribute("cy") + '" r="4" fill="' + commit.color + '" circlesha = "' + commit.oid + '"/>';
  }
}
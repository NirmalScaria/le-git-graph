// color assignment function from showCommits.js
function assignColors(commits, heads) {
  var headOids = new Set();
  for (var head of heads) {
    headOids.add(head.oid);
  }
  var commitDict = {}
  for (var commit of commits) {
    commit.color = undefined;
    commitDict[commit.oid] = commit
  }

  const colors = ["#fd7f6f", "#beb9db", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#fdcce5", "#8bd3c7"];
  var unassignedColors = [...colors];

  var commitIndex = 0;
  for (var commit of commits) {
    var commitsha = commit.oid
    commit = commitDict[commitsha];
    if (commit.color == null || headOids.has(commitsha)) {
      if (unassignedColors.length === 0) {
        unassignedColors = [...colors];
      }
      commit.color = unassignedColors.pop();
      commit.lineIndex = commitIndex;
    }
    commitIndex += 1;
    if (commit.parents.length > 0) {
      const parentOid = commit.parents[0].node.oid;
      if (commitDict[parentOid] && commitDict[parentOid].color == null) {
        commitDict[parentOid].color = commit.color;
        commitDict[parentOid].lineIndex = commit.lineIndex;
      }
    }
  }
  return ([commits, commitDict]);
}


// Core drawing functions from drawGraph.js
var maxX = 100;

async function drawCurve(container, startx, starty, endx, endy, color) {
  var firstLineEndY = starty + ((endy - starty - 40) / 2);
  var secondLineStartY = firstLineEndY + 40;
  container.innerHTML += '<path d = "M ' + startx + ' ' + starty + ' L ' + startx + ' ' + firstLineEndY + ' C ' + startx + ' ' + (parseInt(firstLineEndY) + 20) + ' , ' + endx + ' ' + (parseInt(firstLineEndY) + 20) + ' , ' + endx + ' ' + (parseInt(firstLineEndY) + 40) + ' L ' + endx + ' ' + endy + '" stroke="' + color + '" stroke-width="1" fill = "#00000000"/>';
}

async function drawDottedLine(container, startx, starty, color) {
    container.innerHTML += '<path d = "M ' + startx + ' ' + starty + ' L ' + startx + ' ' + (starty + 10) + '" stroke="' + color + '" stroke-width="1" fill = "#00000000"/>';
    container.innerHTML += '<path d = "M ' + startx + ' ' + (starty + 10) + ' L ' + startx + ' ' + (starty + 30) + '" stroke="' + color + '" stroke-width="1" stroke-dasharray="2,2" fill = "#00000000"/>';
}

function drawCommit(commit) {
  var toAppend = ""
  var cx = commit.cx;
  var cy = commit.cy;
  if (commit.isHead) {
    toAppend += '<circle class = "commitHeadDot" cx="' + cx + '" cy="' + cy + '" r="7" stroke="' + commit.color + '" fill = "#00000000" circlesha = "' + commit.oid + '"/>';
  }
  toAppend += '<circle class = "commitDot" cx="' + cx + '" cy="' + cy + '" r="4" fill="' + commit.color + '" circlesha = "' + commit.oid + '"/>';
  return (toAppend);
}

async function drawGraph(commits, commitDict) {
  var commitsContainer = document.getElementById("commits-container");
  var commitsGraphContainer = document.getElementById("graphSvg");

  commitsGraphContainer.innerHTML = "";
  var yPos = 0;

  var indexArray = Array.from(Array(commits.length), () => new Array(0));
  var lineColors = Array.from('#000000', () => undefined);
  for (var commit of commits) {
    lineColors[commit.lineIndex] = commit.color;
  }
  for (var line = 0; line < commits.length; line++) {
    var lineBeginning = 100;
    var lineEnding = 0;
    for (var commitIndex = 0; commitIndex < commits.length; commitIndex++) {
      var commit = commits[commitIndex];
      var foundLineInParents = false;
      for (var parent of commit.parents) {
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

  // Simplified yPos calculation
  const commitElements = Array.from(commitsContainer.children);
  const commitElementHeight = commitElements.length > 0 ? commitElements[0].offsetHeight : 50;

  commitsGraphContainer.style.height = (commitElements.length * commitElementHeight) + 'px';


  for (var i = 0; i < commits.length; i++) {
    var commit = commits[i];
    var commitXIndex = indexArray[i].indexOf(commit.lineIndex);
    if (commitXIndex == -1) {
      commitXIndex = indexArray[i].length;
    }

    yPos += commitElementHeight / 2;

    commits[i].cx = 30 + (commitXIndex * 14);
    commits[i].cy = yPos;
    // This is a dummy circle to get coordinates, it will be cleared later.
    commitsGraphContainer.innerHTML += '<circle cx="' + commits[i].cx + '" cy="' + yPos + '" r="1" fill="' + commit.color + '" circlesha = "' + commit.oid + '"/>';

    yPos += commitElementHeight / 2;
  }

  // Curve for connecting existing commits
  for (var i = 0; i < (commits.length - 1); i++) {
    var commit = commits[i];
    var hasVisibleParents = false;
    for (var parentItem of commit.parents) {
      var parent = commitDict[parentItem.node.oid];
      var thisCircle = commitsGraphContainer.querySelector('[circlesha="' + commit.oid + '"]');
      var thisx = thisCircle.cx.baseVal.value;
      var thisy = thisCircle.cy.baseVal.value;

      if (parent != undefined) {
        hasVisibleParents = true;
        var nextx = 30 + (14 * (indexArray[i + 1].indexOf(parent.lineIndex)));
        var nexty = commitsGraphContainer.querySelector('[circlesha="' + commits[i + 1].oid + '"]').cy.baseVal.value;
        drawCurve(commitsGraphContainer, thisx, thisy, nextx, nexty, lineColors[parent.lineIndex]);
      }
    }
    if (!hasVisibleParents && commit.parents.length > 0) {
      var thisCircle = commitsGraphContainer.querySelector('[circlesha="' + commit.oid + '"]');
      var thisx = thisCircle.cx.baseVal.value;
      var thisy = thisCircle.cy.baseVal.value;
      drawDottedLine(commitsGraphContainer, thisx, thisy, lineColors[commit.lineIndex]);
    }
  }

  // Curve for maintaining continuity of lines
  for (var thisLineIndex = 0; thisLineIndex < commits.length; thisLineIndex++) {
    for (var i = 0; i < (commits.length - 1); i++) {
      if (indexArray[i].includes(thisLineIndex) && indexArray[i + 1].includes(thisLineIndex)) {
        var thisCircle = commitsGraphContainer.querySelector('[circlesha="' + commits[i].oid + '"]');
        var nextCircle = commitsGraphContainer.querySelector('[circlesha="' + commits[i+1].oid + '"]');
        var thisx = 30 + (14 * (indexArray[i].indexOf(thisLineIndex)));
        var thisy = thisCircle.cy.baseVal.value;
        var nextx = 30 + (14 * (indexArray[i + 1].indexOf(thisLineIndex)));
        var nexty = nextCircle.cy.baseVal.value;
        drawCurve(commitsGraphContainer, thisx, thisy, nextx, nexty, lineColors[thisLineIndex]);
        maxX = Math.max(thisx,maxX);
      }
    }
  }

  // Clear dummy circles and draw final graph
  commitsGraphContainer.innerHTML = "";

  // Re-draw curves
  for (var i = 0; i < (commits.length - 1); i++) {
    var commit = commits[i];
    var hasVisibleParents = false;
    for (var parentItem of commit.parents) {
      var parent = commitDict[parentItem.node.oid];
      if (parent != undefined) {
        hasVisibleParents = true;
        var thisx = commits[i].cx;
        var thisy = commits[i].cy;
        var parentIndexInNextRow = commits.findIndex(c => c.oid === parent.oid);
        var nextx = 30 + (14 * (indexArray[parentIndexInNextRow].indexOf(parent.lineIndex)));
        var nexty = commits[parentIndexInNextRow].cy;
        drawCurve(commitsGraphContainer, thisx, thisy, nextx, nexty, lineColors[parent.lineIndex]);
      }
    }
    if (!hasVisibleParents && commit.parents.length > 0) {
        var thisx = commits[i].cx;
        var thisy = commits[i].cy;
        drawDottedLine(commitsGraphContainer, thisx, thisy, lineColors[commit.lineIndex]);
    }
  }

  // Re-draw continuity lines
  for (var thisLineIndex = 0; thisLineIndex < commits.length; thisLineIndex++) {
    for (var i = 0; i < (commits.length - 1); i++) {
       if (indexArray[i].includes(thisLineIndex) && indexArray[i + 1].includes(thisLineIndex)) {
          var thisx = 30 + (14 * (indexArray[i].indexOf(thisLineIndex)));
          var thisy = commits[i].cy;
          var nextx = 30 + (14 * (indexArray[i + 1].indexOf(thisLineIndex)));
          var nexty = commits[i+1].cy;
          drawCurve(commitsGraphContainer, thisx, thisy, nextx, nexty, lineColors[thisLineIndex]);
       }
    }
  }


  var finalToAppend = "";
  for (var commit of commits) {
    finalToAppend += drawCommit(commit);
  }
  commitsGraphContainer.innerHTML += finalToAppend;

  if(maxX > 100){
    maxX = Math.min(maxX,198)
    var svgContainer = document.querySelector('#graphSvg');
    svgContainer.style.width = maxX + 20 + 'px';
  }
}
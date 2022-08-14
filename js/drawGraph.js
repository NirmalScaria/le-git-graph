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
  for (var commit of commits) {
    var thisCommitItem = document.querySelectorAll('[commitsha="' + commit.oid + '"]')[0];
    yPos += thisCommitItem.offsetHeight / 2;
    // Drawing the commits dots. (This is more of a dummy and will be redrawn so that lines appear below circles)
    // The purpose of this first set of circles is to easily query the position of the commit dot.
    commitsGraphContainer.innerHTML += '<circle cx="' + (30 + (commit.lineIndex * 14)) + '" cy="' + yPos + '" r="1" fill="' + commit.color + '" circlesha = "' + commit.oid + '"/>';
    yPos += thisCommitItem.offsetHeight / 2;
  }
  yPos = 0;
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
      indexArray[i].push(line);
    }
  }
  console.log(indexArray);
  console.log(lineColors);

  for (var commit of commits) {
    var thisCommitItem = document.querySelectorAll('[commitsha="' + commit.oid + '"]')[0];
    yPos += thisCommitItem.offsetHeight / 2;
    for (var parent in commit.parents) {
      var parentSha = (commit.parents[parent].node.oid);
      var parentObject = (commitDict[parentSha]);
      var parentCommitItem = document.querySelectorAll('[circlesha="' + parentSha + '"]')[0];
      var thisCommitDot = document.querySelectorAll('[circlesha="' + commit.oid + '"]')[0];
      if (parentCommitItem == undefined) {
        // Only if the parent is not in the shown commit list
        // Shwoing a dotted indicator.
        if (parent == 0) {
          commitsGraphContainer.innerHTML += '<path stroke-dasharray="2,2" d = "M ' + (30 + (commit.lineIndex * 14)) + ',' + yPos + ' l 0 50" stroke="' + commit.color + '" stroke-width="1" fill="none" />';
          commitsGraphContainer.innerHTML += '<path d = "M ' + (30 + (commit.lineIndex * 14)) + ',' + (yPos + 50) + ' l 10 10 l -20 0" stroke="' + commit.color + '" stroke-width="1" fill="none" />';

        }
        else {
          commitsGraphContainer.innerHTML += '<path  stroke-dasharray="2,2" d = "M ' + (30 + (commit.lineIndex * 14)) + ' ' + (yPos) + ' C ' + (30 + (commit.lineIndex * 14)) + ' ' + (yPos + 20) + ', ' + (30 + (commit.lineIndex * 14) + 14) + ' ' + (yPos + 10) + ', ' + (30 + (commit.lineIndex * 14) + 14) + ' ' + (yPos + 30) + ' " stroke="' + commit.color + '" stroke-width="1" fill = "#00000000"/>';
          commitsGraphContainer.innerHTML += '<path  stroke-dasharray="2,2" d = "M ' + (30 + (commit.lineIndex * 14)) + ' ' + (yPos) + ' C ' + (30 + (commit.lineIndex * 14)) + ' ' + (yPos + 20) + ', ' + (30 + (commit.lineIndex * 14) + 14) + ' ' + (yPos + 10) + ', ' + (30 + (commit.lineIndex * 14) + 14) + ' ' + (yPos + 30) + ' " stroke="' + commit.color + '" stroke-width="1" fill = "#00000000"/>';
        }
        continue;
      }
      var parentx = (parentCommitItem.getAttribute("cx"));
      var parenty = (parentCommitItem.getAttribute("cy"));
      // Line between commits
      // commitsGraphContainer.innerHTML += '<path d = "M ' + (30 + (commit.lineIndex * 14)) + ' ' + (yPos) + ' C ' + (30 + (commit.lineIndex * 14)) + ' ' + (yPos + 30) + ', ' + parentx + ' ' + (yPos+20 ) + ', ' + parentx + ' ' + (yPos + 50) + ' L '+ parentx + ' ' + parenty  + ' " stroke="' + parentObject.color + '" stroke-width="1" fill = "#00000000"/>';
    }
    yPos += thisCommitItem.offsetHeight / 2;
  }
  for (var line = 0; line < 20; line++) {
    for (var commitIndex = 0; commitIndex < commits.length - 1; commitIndex++) {
      if(indexArray[commitIndex].includes(line) && indexArray[commitIndex+1].includes(line)){
       // TODO Draw the lines according to the indexArray.
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
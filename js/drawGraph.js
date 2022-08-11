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
    commitsGraphContainer.innerHTML += '<circle cx="' + (30 + (commit.lineIndex * 20)) + '" cy="' + yPos + '" r="1" fill="' + commit.color + '" circlesha = "' + commit.oid + '"/>';
    yPos += thisCommitItem.offsetHeight / 2;
  }
  yPos = 0;
  for (var commit of commits) {
    var thisCommitItem = document.querySelectorAll('[commitsha="' + commit.oid + '"]')[0];
    yPos += thisCommitItem.offsetHeight / 2;
    for (var parent in commit.parents) {
      var parentSha = (commit.parents[parent].node.oid);
      var parentObject = (commitDict[parentSha]);
      var parentCommitItem = document.querySelectorAll('[circlesha="' + parentSha + '"]')[0];
      if (parentCommitItem == undefined) {
        // TODO: Implement a dotted line or some alternative
        // to represent the parent who is not there in the present page
        continue;
      }
      var parentx = (parentCommitItem.getAttribute("cx"));
      var parenty = (parentCommitItem.getAttribute("cy"));
      // Line between commits
      commitsGraphContainer.innerHTML += '<path d = "M ' + (30 + (commit.lineIndex * 20)) + ' ' + (yPos) + ' C ' + (30 + (commit.lineIndex * 20)) + ' ' + (yPos + 30) + ', ' + parentx + ' ' + (yPos+20 ) + ', ' + parentx + ' ' + (yPos + 50) + ' L '+ parentx + ' ' + parenty  + ' " stroke="' + parentObject.color + '" stroke-width="1" fill = "#00000000"/>';
    }
    yPos += thisCommitItem.offsetHeight / 2;
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
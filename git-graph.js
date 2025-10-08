function assignColors(commits, heads) {
    const colors = ["#D32F2F", "#388E3C", "#1976D2", "#F57C00", "#7B1FA2", "#00796B", "#C2185B", "#5D4037", "#455A64", "#AFB42B"];
    const commitDict = {};

    for (const commit of commits) {
        commit.lane = undefined;
        commit.color = undefined;
        commitDict[commit.oid] = commit;
    }

    let laneCounter = 0;
    const assignedLanes = {};
    const laneColors = {};

    for (const commit of commits) {
        if (assignedLanes[commit.oid] === undefined) {
            assignedLanes[commit.oid] = laneCounter++;
        }
        commit.lane = assignedLanes[commit.oid];

        if (laneColors[commit.lane] === undefined) {
            laneColors[commit.lane] = colors[commit.lane % colors.length];
        }
        commit.color = laneColors[commit.lane];

        if (commit.parents.length > 0) {
            const firstParentOid = commit.parents[0].node.oid;
            if (assignedLanes[firstParentOid] === undefined) {
                assignedLanes[firstParentOid] = commit.lane;
            }
        }
    }
    
    return [commits, commitDict];
}

async function drawCurve(container, startx, starty, endx, endy, color) {
  var firstLineEndY = endy - 30;
  var secondLineStartY = firstLineEndY + 40;
  container.innerHTML += '<path d = "M ' + startx + ' ' + starty 
  + ' L ' + startx + ' ' + firstLineEndY 
  + ' C ' + startx + ' ' + (parseInt(firstLineEndY) + 10) + ' , ' + endx + ' ' + (parseInt(firstLineEndY) + 10) + ' , ' + endx + ' ' + (parseInt(firstLineEndY) + 20) 
  + ' L ' + endx + ' ' + endy + '" stroke="' + color + '" stroke-width="3" fill = "#00000000"/>';
}

async function drawDottedLine(container, startx, starty, color) {
    container.innerHTML += '<path d = "M ' + startx + ' ' + starty + ' L ' + startx + ' ' + (starty + 10) + '" stroke="' + color + '" stroke-width="1" fill = "#00000000"/>';
    container.innerHTML += '<path d = "M ' + startx + ' ' + (starty + 10) + ' L ' + startx + ' ' + (starty + 30) + '" stroke="' + color + '" stroke-width="1" stroke-dasharray="2,2" fill = "#00000000"/>';
}

function drawCommit(commit) {
    const { cx, cy, color, oid, isHead } = commit;
    let toAppend = '';
    if (isHead) {
        toAppend += `<circle class="commitHeadDot" cx="${cx}" cy="${cy}" r="7" stroke="${color}" fill="none" stroke-width="2" circlesha="${oid}"/>`;
    }
    toAppend += `<circle class="commitDot" cx="${cx}" cy="${cy}" r="4" fill="${color}" circlesha="${oid}"/>`;
    return toAppend;
}

async function drawGraph(commits, commitDict) {
    const commitsContainer = document.getElementById("commits-container");
    const commitsGraphContainer = document.getElementById("graphSvg");
    let maxX = 100;

    const indexArraySets = Array.from({ length: commits.length }, () => new Set());
    const commitIndexMap = new Map(commits.map((c, i) => [c.oid, i]));

    for (let i = 0; i < commits.length; i++) {
        const commit = commits[i];
        indexArraySets[i].add(commit.lane);
        for (const parentRef of commit.parents) {
            const parentOid = parentRef.node.oid;
            const parentIndex = commitIndexMap.get(parentOid);
            if (parentIndex !== undefined) {
                const laneForPath = commit.lane;
                for (let j = i + 1; j <= parentIndex; j++) {
                    indexArraySets[j].add(laneForPath);
                }
            }
        }
    }
    const indexArray = indexArraySets.map(laneSet => Array.from(laneSet).sort((a, b) => a - b));

    const commitElements = Array.from(commitsContainer.children);
    const commitElementHeight = commitElements.length > 0 ? commitElements[0].offsetHeight : 50;
    commitsGraphContainer.style.height = `${commits.length * commitElementHeight}px`;

    for (let i = 0; i < commits.length; i++) {
        const commit = commits[i];
        const yPos = (i * commitElementHeight) + (commitElementHeight / 2);
        
        let commitXIndex = indexArray[i].indexOf(commit.lane);
        if (commitXIndex === -1) {
             commitXIndex = indexArray[i].length;
        }
        
        commit.cx = 30 + (commitXIndex * 14);
        commit.cy = yPos;
        maxX = Math.max(maxX, commit.cx);
    }
    
    commitsGraphContainer.innerHTML = "";

    for (const commit of commits) {
        for (const parentRef of commit.parents) {
            const parent = commitDict[parentRef.node.oid];
            if (parent) {
                // ==========================================================
                //  THE FINAL FIX IS HERE:
                //  The target 'x' coordinate (nextx) MUST be the parent's
                //  actual calculated 'cx' coordinate, not a theoretical one.
                // ==========================================================
                const nextx = parent.cx;
                const nexty = parent.cy;
                
                drawCurve(commitsGraphContainer, commit.cx, commit.cy, nextx, nexty, commit.color);
            }
        }
    }

    let finalCommitsToAppend = "";
    for (const commit of commits) {
        finalCommitsToAppend += drawCommit(commit);
    }
    commitsGraphContainer.innerHTML += finalCommitsToAppend;

    if (maxX > 100) {
        commitsGraphContainer.style.width = `${maxX + 20}px`;
    }
}
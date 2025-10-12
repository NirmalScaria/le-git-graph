function assignColors(commits, heads) {
    const colors = ["#D32F2F", "#388E3C", "#1976D2", "#F57C00", "#7B1FA2", "#00796B", "#C2185B", "#5D4037", "#455A64", "#AFB42B"];
    
    const commitDict = {};
    const commitIndexMap = new Map(commits.map((c, i) => [c.id, i]));

    for (const commit of commits) {
        commit.column = undefined;
        commit.color = undefined;
        commit.children = [];
        commit.isHead = heads.some(h => h.id === commit.id);
        commitDict[commit.id] = commit;
    }

    for (const commit of commits) {
        for (const parentOid of commit.parents) {
            const parent = commitDict[parentOid];
            if (parent) {
                parent.children.push(commit.id);
            }
        }
    }

    const layoutGrid = Array.from({ length: commits.length }, () => new Set());
    const renderLines = [];

    let nextColorIndex = 0;
    function getNewColor() {
        const color = colors[nextColorIndex % colors.length];
        nextColorIndex++;
        return color;
    }

    function findAvailableColumn(rowIndex, startColumn = 0) {
        let col = startColumn;
        while (layoutGrid[rowIndex].has(col)) { col++; }
        return col;
    }

    function findPath(startRow, endRow, startHint = 0) {
        const path = [];
        let searchColumn = startHint;
        for (let r = startRow + 1; r < endRow; r++) {
            let pathColumn = searchColumn;
            while (layoutGrid[r].has(pathColumn)) {
                pathColumn++;
            }
            path.push({ row: r, column: pathColumn });
            searchColumn = 0;
        }
        return path;
    }

    function buildScene(commitId, startColumn, parentLine) {
        const commit = commitDict[commitId];
        
        if (commit.column !== undefined) {
            const parentCommit = parentLine.commit;
            const parentRow = commitIndexMap.get(parentCommit.id);
            const parentCol = parentCommit.column;
            
            const mergePathLine = { 
                color: parentCommit.color, 
                points: [{ row: parentRow, column: parentCol }] 
            };
            
            const childRow = commitIndexMap.get(commitId);
            if (parentRow < childRow) { // Corrected comparison
                const pathPoints = findPath(parentRow, childRow, parentCol);
                pathPoints.forEach(p => layoutGrid[p.row].add(p.column));
                mergePathLine.points.push(...pathPoints);
            }
            mergePathLine.points.push({ row: childRow, column: commit.column });
            renderLines.unshift(mergePathLine);
            return;
        }

        const rowIndex = commitIndexMap.get(commitId);
        const column = findAvailableColumn(rowIndex, startColumn);
        
        commit.column = column;
        layoutGrid[rowIndex].add(column);
        
        let currentLine;
        if (parentLine && commit.parents.length > 0 && parentLine.commit.id === commit.parents[0]) {
            currentLine = parentLine;
            commit.color = parentLine.color;
        } else {
            const newColor = getNewColor();
            currentLine = { color: newColor, points: [] };
            commit.color = newColor;
            renderLines.unshift(currentLine);
        }
        
        currentLine.commit = commit;
        
        const lastPoint = currentLine.points[currentLine.points.length - 1];
        if (lastPoint) {
            const parentRow = lastPoint.row;
            if(parentRow < rowIndex) { // Corrected comparison
                const intermediatePath = findPath(parentRow, rowIndex, lastPoint.column);
                intermediatePath.forEach(p => layoutGrid[p.row].add(p.column));
                currentLine.points.push(...intermediatePath);
            }
        }
        currentLine.points.push({ row: rowIndex, column: column });

        const commitPoint = currentLine.points.find(p => p.row === rowIndex && p.column === column);
        if (commitPoint) {
            commitPoint.commit = {
                id: commit.id,
                isHead: commit.isHead,
                color: commit.color
            };
        }
        
        const children = commit.children.map(id => commitDict[id])
            .sort((a, b) => commitIndexMap.get(a.id) - commitIndexMap.get(b.id)); // Corrected sort

        if (children.length > 0) {
            buildScene(children[0].id, column, currentLine);
        }

        for (let i = 1; i < children.length; i++) {
            const childCommit = commitDict[children[i].id];
            if (childCommit.column !== undefined) {
                buildScene(children[i].id, column + 1, currentLine);
            } else {
                const newColor = getNewColor();
                const branchLine = {
                    color: newColor,
                    commit: commit,
                    points: [{ row: rowIndex, column: column }]
                };
                renderLines.unshift(branchLine);
                buildScene(children[i].id, column + 1, branchLine);
            }
        }
    }

    const rootNodes = commits.filter(c => c.parents.length === 0);
    for (const root of rootNodes) {
        buildScene(root.id, 0, null);
    }
    
    const totalRows = commits.length;
    return [renderLines, totalRows];
}

async function drawGraph(renderLines, totalRows, containerHeight) {
    const commitsGraphContainer = document.getElementById("graphSvg");
    const commitElementHeight = containerHeight / totalRows;

    const indexArraySets = Array.from({ length: totalRows }, () => new Set());
    for (const line of renderLines) {
        for (const point of line.points) {
            if (point.row >= 0 && point.row < totalRows) {
                indexArraySets[point.row].add(point.column);
            }
        }
    }
    const indexArray = indexArraySets.map(s => Array.from(s).sort((a, b) => a - b));

    function getPixelCoords(row, column) {
        const y = ((totalRows - 1 - row) * commitElementHeight) + (commitElementHeight / 2); // Flipped Y-axis
        if (!indexArray[row]) { return { x: 30 + (column * 14), y: y }; }
        const xIndex = indexArray[row].indexOf(column);
        if (xIndex === -1) { return { x: 30 + (column * 14), y: y }; }
        const x = 30 + (xIndex * 14);
        return { x, y };
    }

    function drawComplexPath(points, color) {
        if (points.length < 2) return "";
        let d = "";
        const start = getPixelCoords(points[0].row, points[0].column);
        d += `M ${start.x} ${start.y}`;
        for (let i = 1; i < points.length; i++) {
            const curr = getPixelCoords(points[i].row, points[i].column);
            const prev = getPixelCoords(points[i - 1].row, points[i - 1].column);
            if (prev.x !== curr.x && prev.y !== curr.y) {
                d += ` L ${prev.x} ${prev.y - 5}`;
                d += ` C ${prev.x} ${prev.y - 5}, ${prev.x} ${prev.y - 5}, ${curr.x} ${prev.y-15}`;
                d += ` L ${curr.x} ${curr.y}`;
            } else {
                d += ` L ${curr.x} ${curr.y}`;
            }
        }
        return `<path d="${d}" stroke="${color}" stroke-width="3" fill="none" />`;
    }

    let svgPaths = "";
    for (const line of renderLines) {
        svgPaths += drawComplexPath(line.points, line.color);
    }

    let svgCommits = "";
    let maxX = 0;
    for (const line of renderLines) {
        for (const point of line.points) {
            if (point.commit) {
                const coords = getPixelCoords(point.row, point.column);
                maxX = Math.max(maxX, coords.x);
                if (point.commit.isHead) {
                    svgCommits += `<circle class="commitHeadDot" cx="${coords.x}" cy="${coords.y}" r="7" stroke="${point.commit.color}" fill="none" stroke-width="2" circlesha="${point.commit.id}"/>`;
                }
                svgCommits += `<circle class="commitDot" cx="${coords.x}" cy="${coords.y}" r="4" fill="${point.commit.color}" circlesha="${point.commit.id}"/>`;
            }
        }
    }
    
    commitsGraphContainer.innerHTML = svgPaths + svgCommits;
    commitsGraphContainer.style.width = `${maxX + 20}px`;
}
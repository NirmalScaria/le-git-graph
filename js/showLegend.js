function showLegend(heads) {
    var legendContainer = document.getElementById("legendContainer");
    var branchButton = legendContainer.querySelector("#branchButton").cloneNode(true);
    legendContainer.innerHTML = "";
    for(var head of heads) {
        var newBranch = branchButton.cloneNode(true);
        newBranch.querySelector("#branchName").innerHTML = head.name;
        if(document.querySelector('[circlesha="' + head.oid + '"]') == undefined) {
            // Heads contain all the branches of the repo.
            // We need legends only for the branches that have
            // at least one commit displayed on the page.
            continue;
        }
        var color = document.querySelector('[circlesha="' + head.oid + '"]').getAttribute("fill");
        newBranch.querySelector("#insideCircle").setAttribute("fill", color);
        newBranch.querySelector("#outsideCircle").setAttribute("stroke", color);
        newBranch.setAttribute("commitId", head.oid);
        newBranch.setAttribute("branchName", head.name);
        newBranch.setAttribute("branchColor", color);
        legendContainer.appendChild(newBranch);
    }
    legendContainer.style.display = "block";
}
function setBranchOptions(branches, selectedBranchIds) {
    var branchesContainer = document.getElementById("branches-list-parent");
    var existingChild = branchesContainer.children[0];
    // Add the branch to the dropdown list.
    Array.from(branches).forEach((branch) => {
        var newChild = existingChild.cloneNode(true);
        newChild.children[1].innerHTML = branch.name;
        newChild.setAttribute("branch-sha", branch.commit.sha);
        newChild.addEventListener("click", () => {
            var thisItem = document.querySelector(`[branch-sha="${branch.commit.sha}"]`);

            if (selectedBranchIds.includes(branch.commit.sha)) {
                selectedBranchIds = selectedBranchIds.filter(id => id != branch.commit.sha);
                thisItem.setAttribute("aria-checked", "false");
            }
            else {
                selectedBranchIds.push(branch.commit.sha);
                thisItem.setAttribute("aria-checked", "true");
            }
            if (branches.length == selectedBranchIds.length) {
                branchesContainer.children[0].setAttribute("aria-checked", "true");
            }
            else {
                branchesContainer.children[0].setAttribute("aria-checked", "false");
            }
        }
        );
        branchesContainer.appendChild(newChild);
    });
    // Action for the "All branches" button
    branchesContainer.children[0].addEventListener("click", () => {
        if (branchesContainer.children[0].getAttribute("aria-checked") == "true") {
            selectedBranchIds = [];
            Array.from(branchesContainer.children).forEach((child) => {
                child.setAttribute("aria-checked", "false");
            }
            );
        }
        else {
            selectedBranchIds = [];
            var i = 0;
            Array.from(branchesContainer.children).forEach((child) => {
                child.setAttribute("aria-checked", "true");
                if (i != 0 && branchesContainer.children[i].getAttribute("branch-sha") != null) {
                    selectedBranchIds.push(child.getAttribute("branch-sha"));
                }
                i += 1;
            });
        }
    });
}
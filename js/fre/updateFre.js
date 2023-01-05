// NOTE: IMPORTANT!
// This file is heavily version specific.
// Either avoid FRE by making changes in serviceWorker.js
// or make changes here to make it work with the current version.
async function updateFre(resume) {
    openCommitsTab();
    keepCheckingForAuth(updateFreStep1, clearToolTip);
}

async function updateFreStep1() {
    createOverlay();
    clearToolTip();
    var secondCommitDot = document.getElementsByClassName("commitDot")[1];
    var secondsha = secondCommitDot.attributes.circlesha.value;
    await hoverOnCommit(secondsha);
    var hovercard = document.getElementById("head-indication-section").parentElement.parentElement.parentElement.parentElement;
    focusOnItem(hovercard, [70, 10, 10, 10]);
    showToolTip(
        hovercard,
        "left-top",
        "Welcome to Le Git Graph 1.1.1",
        "Hover on any commit to see details ✨",
        "Now you can put your mouse pointer on any commit dot and it opens this tooltip which contains detailed information about that commit",
        ["Continue [1/2]"],
        ["btn-primary"],
        [nextFrom3]
    );
    function nextFrom3() {
        removeHoverFrom(secondCommitDot);
        updateFreStep2();
    }

}
function updateFreStep2() {
    clearToolTip();
    var starButton = document.getElementsByClassName("starring-container d-flex")[0];
    var clickStarButton = starButton.querySelectorAll(".rounded-left-2")[1];
    console.log(clickStarButton);
    focusOnItem(starButton, 5, step3withStar);

    showToolTip(
        starButton,
        "top-right",
        "",
        "Please consider starring this repository!",
        "This is the project repository of Le Git Graph extension. If you like it so far, please consider starring it!",
        ["Previous", "Do not star", "Star and Finish"],
        ["btn-secondary", "btn-secondary", "btn-primary"],
        [updateFreStep1, step3withoutStar, step3withStar]
    );

    function step3withoutStar() {
        clearToolTip();
    }
    function step3withStar() {
        if (starButton.classList.contains("on") == false) {
            clickStarButton.click();
        }
        clearToolTip();
    }
}

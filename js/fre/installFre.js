// NOTE: This file acts like a script for the FRE.
// Make necessary changes to this file to change the FRE.

function installFre(resume) {
    const observer = new MutationObserver((mutations, obs) => {
      const commitsButton = document.getElementById("commits-tab");
      if (commitsButton) {
        obs.disconnect();
        openCommitsTab();
        if (resume == "true") {
          createOverlay();
          installFreStep2();
        } else {
          installFreStep1();
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

async function installFreStep1() {
    createOverlay();
    clearToolTip();
    window.onload = () => {
        var commitsButton = document.getElementById("commits-tab");
        focusOnItem(commitsButton, 10);
        showToolTip(
            commitsButton,
            "top-left",
            "",
            "Notice the new tab added to GitHub?",
            "Open this tab from any repository and it will give you this page, where you can find the git graph, and much more!",
            ["Continue [1/3]"],
            ["btn-primary"],
            [installFreStep2]
        );
    }
}

function installFreStep2() {
    keepCheckingForAuth(step2proceed, clearToolTip);
    function step2proceed() {
        clearToolTip();
        var graphSvg = document.getElementById("graphSvg");
        focusOnItem(graphSvg, 0);
        showToolTip(
            graphSvg,
            "left-top",
            "",
            "Commits are arranged latest on top",
            "A double circle on commit represents the head of some branch. This graph represents how the commits are connected, diverted, and merged.",
            ["Previous", "Continue [2/3]"],
            ["btn-secondary", "btn-primary"],
            [installFreStep1, installFreStep3]
        );
    }
}

async function installFreStep3() {
    clearToolTip();
    var secondCommitDot = document.getElementsByClassName("commitDot")[1];
    var secondsha = secondCommitDot.attributes.circlesha.value;
    await hoverOnCommit(secondsha);
    var hovercard = document.getElementById("head-indication-section").parentElement.parentElement.parentElement.parentElement;
    focusOnItem(hovercard, [70, 10, 10, 10]);
    showToolTip(
        hovercard,
        "left-top",
        "",
        "Hover on any commit to see details",
        "Put your mouse pointer on any commit dot and it opens this tooltip which contains detailed information about that commit",
        ["Previous", "Continue [3/3]"],
        ["btn-secondary", "btn-primary"],
        [prevFrom3, nextFrom3]
    );
    function nextFrom3() {
        removeHoverFrom(secondCommitDot);
        installFreStep4();
    }
    function prevFrom3() {
        removeHoverFrom(secondCommitDot);
        installFreStep2();
    }
}
function installFreStep4() {
    clearToolTip();
    var starButton = document.getElementsByClassName("starring-container d-flex")[0];
    var clickStarButton = starButton.querySelectorAll(".rounded-left-2")[1];
    console.log(clickStarButton);
    focusOnItem(starButton, 5, step5withStar);

    showToolTip(
        starButton,
        "top-right",
        "",
        "Please consider starring this repository!",
        "This is the project repository of Le Git Graph extension. I made this alone and it was a lot of work. If you like it so far, please consider starring it!",
        ["Previous", "Do not star", "Star and Finish"],
        ["btn-secondary", "btn-secondary", "btn-primary"],
        [installFreStep3, step5withoutStar, step5withStar]
    );

    function step5withoutStar() {
        clearToolTip();
    }
    function step5withStar() {
        if (starButton.classList.contains("on") == false) {
            clickStarButton.click();
        }
        clearToolTip();
    }
}

// This step is currently not used.
function installFreStep5() {
    clearToolTip();
    focusOnItem(undefined, 0);
    showToolTip(
        "",
        "cover",
        "Welcome to Le Git Graph 1.1.1",
        "Try with your favourite repositories!",
        "Le Git Graph works with every repository that you have access to. Simply open those repositories in browser and Le Git Graph should work out of the box. If something feels wrong, kindly report as an issue at this repository.",
        ["Done"],
        ["btn-primary"],
        [closeFre]);
}
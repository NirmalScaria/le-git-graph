// Auto-load functionality for commits
// This replaces the "Load More" button with automatic loading when scrolling

let isAutoLoading = false;
let lastCommits = null;
let lastBranchNames = null;
let lastAllCommits = null;
let lastHeads = null;
let lastPageNo = null;
let lastAllBranches = null;
let scrollTimeout = null;

// Function to check if user has scrolled near the bottom
function isNearBottom(threshold = 300) {
    const commitsContainer = document.getElementById("commits-outside-container");
    if (!commitsContainer) return false;
    
    const rect = commitsContainer.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Check if the bottom of the commits container is within threshold pixels of viewport bottom
    return rect.bottom <= windowHeight + threshold;
}

// Function to check if there are more commits to load
function hasMoreCommitsToLoad() {
    return lastCommits && lastCommits.length >= 10;
}

// Function to handle scroll events with debouncing
function handleScroll() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(() => {
        if (isAutoLoading) return; // Prevent multiple simultaneous loads
        
        if (isNearBottom() && hasMoreCommitsToLoad()) {
            console.log("Auto-loading more commits...");
            triggerAutoLoad();
        }
    }, 150); // Debounce for 150ms
}

// Function to trigger automatic loading
async function triggerAutoLoad() {
    if (isAutoLoading) return;
    
    isAutoLoading = true;
    
    try {
        // Call fetchFurther with the stored parameters
        await fetchFurther(
            lastCommits.slice(-10), 
            lastAllCommits, 
            lastHeads, 
            lastPageNo, 
            lastBranchNames, 
            lastAllBranches
        );
    } catch (error) {
        console.error("Error during auto-load:", error);
    } finally {
        isAutoLoading = false;
    }
}

// Function to store the parameters for auto-loading
function storeAutoLoadParams(commits, branchNames, allCommits, heads, pageNo, allBranches) {
    lastCommits = commits;
    lastBranchNames = branchNames;
    lastAllCommits = allCommits;
    lastHeads = heads;
    lastPageNo = pageNo;
    lastAllBranches = allBranches;
}

// Function to update auto-load indicator theme
function updateAutoLoadTheme() {
    const indicator = document.getElementById("auto-load-indicator");
    const endMessage = document.getElementById("end-of-commits-message");
    
    if (indicator || endMessage) {
        // Remove existing indicators and recreate them with new theme
        if (indicator) {
            hideAutoLoadIndicator();
            setTimeout(() => showAutoLoadIndicator(), 100);
        }
        
        if (endMessage) {
            const commitsOl = document.getElementById("commitsOl");
            if (endMessage.parentNode) {
                endMessage.parentNode.removeChild(endMessage);
            }
            setTimeout(() => showEndOfCommitsMessage(), 100);
        }
    }
}

// Function to initialize auto-load functionality
function initializeAutoLoad() {
    // Remove existing scroll listeners to prevent duplicates
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('scroll', handleScroll);
    
    // Add scroll listener to window
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Add CSS class to indicate auto-load is active
    const commitsContainer = document.getElementById("commits-outside-container");
    if (commitsContainer) {
        commitsContainer.classList.add("auto-load-active");
    }
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'data-color-mode' || 
                 mutation.attributeName === 'data-dark-theme' ||
                 mutation.attributeName === 'class')) {
                updateAutoLoadTheme();
            }
        });
    });
    
    // Observe theme changes on document element and body
    observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['data-color-mode', 'data-dark-theme', 'class'] 
    });
    observer.observe(document.body, { 
        attributes: true, 
        attributeFilter: ['class'] 
    });
    
    console.log("Auto-load initialized with theme detection");
}

// Function to disable auto-load (cleanup)
function disableAutoLoad() {
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('scroll', handleScroll);
    
    // Clear any pending scroll timeout
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
        scrollTimeout = null;
    }
    
    // Reset state
    isAutoLoading = false;
    lastCommits = null;
    lastBranchNames = null;
    lastAllCommits = null;
    lastHeads = null;
    lastPageNo = null;
    lastAllBranches = null;
    
    // Clean up UI elements
    hideAutoLoadIndicator();
    const endMessage = document.getElementById("end-of-commits-message");
    if (endMessage && endMessage.parentNode) {
        endMessage.parentNode.removeChild(endMessage);
    }
    
    console.log("Auto-load disabled");
}

// Function to hide the "Load More" button
function hideLoadMoreButton() {
    const paginateContainer = document.querySelector(".paginate-container");
    if (paginateContainer) {
        paginateContainer.style.display = "none";
    }
}

// Function to detect GitHub theme (dark/light mode)
function getGitHubTheme() {
    // Check for dark theme indicators
    const isDark = document.documentElement.getAttribute('data-color-mode') === 'dark' ||
                   document.documentElement.getAttribute('data-dark-theme') ||
                   document.body.classList.contains('dark') ||
                   document.querySelector('[data-color-mode="dark"]') ||
                   getComputedStyle(document.body).backgroundColor === 'rgb(13, 17, 23)';
    
    return isDark ? 'dark' : 'light';
}

// Function to show loading indicator at bottom
function showAutoLoadIndicator() {
    const commitsOl = document.getElementById("commitsOl");
    if (!commitsOl) return;
    
    // Check if indicator already exists
    let existingIndicator = document.getElementById("auto-load-indicator");
    if (existingIndicator) {
        existingIndicator.style.display = "block";
        return;
    }
    
    const theme = getGitHubTheme();
    const isDark = theme === 'dark';
    
    // Theme-specific colors
    const backgroundColor = isDark ? '#0d1117' : '#ffffff';
    const borderColor = isDark ? '#30363d' : '#d0d7de';
    const textColor = isDark ? '#8b949e' : '#656d76';
    const spinnerBorderColor = isDark ? '#21262d' : '#e1e4e8';
    const spinnerActiveColor = isDark ? '#58a6ff' : '#0969da';
    
    // Create loading indicator
    const indicator = document.createElement("div");
    indicator.id = "auto-load-indicator";
    indicator.className = "Box Box--responsive text-center rounded-2 border";
    indicator.style.margin = "10px 0";
    indicator.style.transition = "opacity 0.3s ease";
    indicator.style.backgroundColor = backgroundColor;
    indicator.style.borderColor = borderColor;
    indicator.style.color = textColor;
    
    indicator.innerHTML = `
        <style>
            @keyframes auto-load-spinner {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
            
            @keyframes auto-load-pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.5;
                }
            }
            
            .auto-load-spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid ${spinnerBorderColor};
                border-top: 2px solid ${spinnerActiveColor};
                border-radius: 50%;
                animation: auto-load-spinner 0.8s linear infinite;
                margin-left: 50px;
            }
            
            .auto-load-text {
                animation: auto-load-pulse 1.5s ease-in-out infinite;
                transform: translateY(-10px);
            }
        </style>
        <div class="position-relative py-3">
            <div class="d-flex flex-column align-items-center">
                <div class="auto-load-spinner mb-2"></div>
                <span class="auto-load-text f6" style="color: ${textColor};">Loading more commits...</span>
            </div>
        </div>
    `;
    
    commitsOl.appendChild(indicator);
}

// Function to hide loading indicator
function hideAutoLoadIndicator() {
    const indicator = document.getElementById("auto-load-indicator");
    if (indicator) {
        indicator.style.opacity = "0";
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 300);
    }
}

// Function to show "end of commits" message
function showEndOfCommitsMessage() {
    const commitsOl = document.getElementById("commitsOl");
    if (!commitsOl) return;
    
    // Remove auto-load indicator first
    hideAutoLoadIndicator();
    
    // Check if message already exists
    let existingMessage = document.getElementById("end-of-commits-message");
    if (existingMessage) return;
    
    const theme = getGitHubTheme();
    const isDark = theme === 'dark';
    
    // Theme-specific colors
    const backgroundColor = isDark ? '#0d1117' : '#ffffff';
    const borderColor = isDark ? '#30363d' : '#d0d7de';
    const textColor = isDark ? '#8b949e' : '#656d76';
    const successColor = isDark ? '#3fb950' : '#1a7f37';
    
    const message = document.createElement("div");
    message.id = "end-of-commits-message";
    message.className = "Box Box--responsive text-center rounded-2 border";
    message.style.margin = "10px 0";
    message.style.opacity = "0";
    message.style.transition = "opacity 0.3s ease";
    message.style.backgroundColor = backgroundColor;
    message.style.borderColor = borderColor;
    message.style.color = textColor;
    
    message.innerHTML = `
        <style>
            @keyframes end-message-fade-in {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .end-message-content {
                animation: end-message-fade-in 0.5s ease-out;
            }
            
            .success-icon {
                color: ${successColor};
            }
        </style>
        <div class="position-relative py-3">
            <div class="end-message-content d-flex flex-column align-items-center">
                <svg class="success-icon mb-2" height="24" viewBox="0 0 16 16" version="1.1" width="24" aria-hidden="true">
                    <path fill="currentColor" fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
                </svg>
                <div class="f6" style="color: ${textColor};">You've reached the end of the commit history</div>
            </div>
        </div>
    `;
    
    commitsOl.appendChild(message);
    
    // Fade in the message
    setTimeout(() => {
        message.style.opacity = "1";
    }, 100);
}

// Debug helper functions for testing auto-load functionality
// Paste these into browser console while testing

// 1. Monitor auto-load state
function debugAutoLoad() {
    console.log('=== Auto-Load Debug Info ===');
    console.log('isAutoLoading:', window.isAutoLoading || 'undefined');
    console.log('lastCommits length:', window.lastCommits?.length || 'undefined');
    console.log('Auto-load container:', document.getElementById('commits-outside-container'));
    console.log('Auto-load indicator:', document.getElementById('auto-load-indicator'));
    console.log('End message:', document.getElementById('end-of-commits-message'));
    console.log('Commits container height:', document.getElementById('commits-outside-container')?.getBoundingClientRect());
}

// 2. Force trigger auto-load (for testing)
function forceAutoLoad() {
    if (typeof triggerAutoLoad === 'function') {
        console.log('Forcing auto-load...');
        triggerAutoLoad();
    } else {
        console.error('triggerAutoLoad function not found');
    }
}

// 3. Test scroll detection
function testScrollDetection() {
    if (typeof isNearBottom === 'function') {
        console.log('Near bottom?', isNearBottom());
        console.log('Window height:', window.innerHeight);
        console.log('Container bottom:', document.getElementById('commits-outside-container')?.getBoundingClientRect().bottom);
    } else {
        console.error('isNearBottom function not found');
    }
}

// 4. Monitor network requests
function monitorNetworkRequests() {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        if (args[0].includes('api.github.com/graphql')) {
            console.log('🌐 GitHub GraphQL Request:', args[0]);
            console.log('📤 Request body:', JSON.parse(args[1]?.body || '{}'));
        }
        return originalFetch.apply(this, args)
            .then(response => {
                if (args[0].includes('api.github.com/graphql')) {
                    console.log('📥 Response status:', response.status);
                }
                return response;
            });
    };
    console.log('✅ Network monitoring enabled');
}

// 5. Check event listeners
function checkEventListeners() {
    console.log('=== Event Listeners Debug ===');
    console.log('Window scroll listeners:', getEventListeners(window).scroll?.length || 0);
    console.log('Document scroll listeners:', getEventListeners(document).scroll?.length || 0);
}

console.log('🔧 Debug functions loaded. Available commands:');
console.log('- debugAutoLoad() - Check auto-load state');
console.log('- forceAutoLoad() - Trigger auto-load manually');
console.log('- testScrollDetection() - Test scroll position detection');
console.log('- monitorNetworkRequests() - Monitor API calls');
console.log('- checkEventListeners() - Check scroll event listeners');

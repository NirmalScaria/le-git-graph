# Le Git Graph Auto-Load Testing Checklist

## ✅ Core Functionality Tests

### Basic Auto-Load
- [ ] Extension loads without errors in browser console
- [ ] "Commits" tab appears in GitHub repository navigation
- [ ] Clicking "Commits" tab loads initial commit graph
- [ ] Scrolling down triggers auto-load (within ~300px of bottom)
- [ ] Loading spinner appears during fetch
- [ ] New commits are appended without page refresh
- [ ] Graph lines continue properly across loaded batches

### UI/UX Tests
- [ ] "Load More" button is hidden when auto-load is active
- [ ] Loading indicator has proper GitHub styling
- [ ] "End of commits" message appears when no more data
- [ ] Smooth transitions and animations work
- [ ] Auto-load respects debouncing (no rapid-fire requests)

### State Management
- [ ] Auto-load works across multiple scroll sessions
- [ ] Switching away from Commits tab disables auto-load
- [ ] Returning to Commits tab re-enables auto-load
- [ ] Browser refresh resets auto-load state properly
- [ ] No memory leaks from event listeners

### Error Handling
- [ ] Network errors don't break auto-load
- [ ] API rate limits are handled gracefully
- [ ] Invalid repositories show appropriate messages
- [ ] Private repos prompt for authentication

### Performance Tests
- [ ] No lag during scrolling with large commit histories
- [ ] Memory usage remains stable during extended sessions
- [ ] Console shows no JavaScript errors
- [ ] Extension doesn't interfere with other GitHub functionality

## 🔧 Test Repositories

### Small Repositories (< 100 commits)
- [ ] Personal test repos
- [ ] Newly created repositories

### Medium Repositories (100-1000 commits)
- [ ] Popular open source projects
- [ ] Active development repositories

### Large Repositories (1000+ commits)
- [ ] `microsoft/vscode`
- [ ] `facebook/react`
- [ ] `angular/angular`

### Edge Case Repositories
- [ ] Empty repositories
- [ ] Single commit repositories
- [ ] Repositories with merge commits
- [ ] Repositories with complex branching

## 🛠️ Development Testing

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Edge (latest)
- [ ] Firefox (if supporting)

### GitHub Themes
- [ ] Light theme
- [ ] Dark theme
- [ ] High contrast themes

### Screen Sizes
- [ ] Desktop (1920x1080+)
- [ ] Laptop (1366x768)
- [ ] Tablet view
- [ ] Mobile view (if applicable)

## 🐛 Debug Information

### Console Logs to Check
- [ ] "Auto-load initialized" appears
- [ ] "Auto-loading more commits..." during scroll
- [ ] "Auto-load disabled" when switching tabs
- [ ] No error messages in console

### Network Requests
- [ ] GraphQL requests to GitHub API are properly formed
- [ ] Rate limiting is respected
- [ ] Proper authentication headers

### DOM Elements
- [ ] `#auto-load-indicator` appears/disappears correctly
- [ ] `#end-of-commits-message` shows when appropriate
- [ ] `.auto-load-active` class is applied to container
- [ ] `.paginate-container` is hidden

## ✨ User Experience Validation

- [ ] Feature feels natural and smooth
- [ ] No unexpected behavior or glitches
- [ ] Performance is comparable to native GitHub
- [ ] Visual feedback is clear and helpful
- [ ] Error states are user-friendly

---

## 📝 Notes
Record any issues or observations here:

- 
- 
- 

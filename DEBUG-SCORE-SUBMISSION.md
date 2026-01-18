# 🐛 Debugging Score Submission Issues

## Quick Debugging Steps

### 1. Check Browser Console
Open browser DevTools (F12) → Console tab, then:
- Play a game or flashcard
- Submit score
- Look for:
  - `Submitting math game score:` or `Submitting flashcard progress:`
  - `Score submission response:`
  - Any error messages in red

### 2. Check Network Tab
Open DevTools → Network tab, then:
- Play and submit score
- Look for `submit-score` request
- Check:
  - Status code (should be 200)
  - Response body (should show `pointsEarned`)
  - Request payload (check if data is correct)

### 3. Check Backend Logs
In the terminal where backend is running, look for:
- `[submitScore] User: ...`
- `[submitScore] Points earned: ...`
- `[submitScore] Gamification updated successfully`
- Any error messages

### 4. Test API Directly
```bash
# Get your access token from browser localStorage
# Then test:
curl -X POST http://localhost:3001/api/gamification/submit-score \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "contentId": "test-id",
    "score": 5,
    "maxScore": 10,
    "sampleQuizData": {
      "type": "MINI_GAME",
      "title": "Test Game",
      "description": "Test",
      "contentData": {},
      "category": "Test"
    }
  }'
```

### 5. Check Database
```bash
# Connect to database
psql -d lioarcade

# Check if progress was saved
SELECT * FROM user_progress ORDER BY created_at DESC LIMIT 5;

# Check if gamification was updated
SELECT user_id, points, level FROM gamification ORDER BY points DESC LIMIT 10;
```

## Common Issues

### Issue 1: "Content not found"
**Symptom:** Error message says content not found
**Fix:** Make sure `sampleQuizData` is included for sample content

### Issue 2: "Validation error"
**Symptom:** 400 error with validation details
**Fix:** Check that score and maxScore are numbers, contentId is valid

### Issue 3: Leaderboard not updating
**Symptom:** Score submits but leaderboard doesn't change
**Possible causes:**
- Leaderboard page not open (event won't fire)
- Browser cache
- Leaderboard query issue

**Fix:**
- Manually refresh leaderboard page
- Check browser console for `Score submitted event received`
- Verify points were added in database

### Issue 4: Category leaderboard shows 0
**Symptom:** Category-specific leaderboard empty or wrong
**Fix:** This is expected if no one has played that category yet

## Manual Refresh Test

1. Submit a score from game/flashcard
2. Open leaderboard page in another tab
3. Click "Refresh" button
4. Check if your points appear

## Still Not Working?

Share these details:
1. Browser console errors (screenshot)
2. Network tab - submit-score request details
3. Backend terminal logs
4. What you see vs what you expect

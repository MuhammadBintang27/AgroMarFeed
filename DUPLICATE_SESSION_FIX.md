# Duplicate Session Fix for OAuth Authentication

## Problem Identified

During OAuth login (Google/GitHub), **2 sessions were being created** in the database:

1. **First session**: Created in the OAuth callback (`req.logIn(user)`) - ✅ Correct
2. **Second session**: Created by multiple frontend calls to authentication endpoints - ❌ Duplicate

## Root Cause Analysis

### Frontend Issues:

1. **Multiple useEffect calls**: UserContext had 2 useEffect hooks that could both trigger authentication
2. **Race condition**: Initial `fetchUser()` and OAuth handling `fetchUser()` running simultaneously
3. **No coordination**: No flag to prevent multiple authentication attempts

### Backend Issues:

1. **Manual session setting**: `validate-oauth-token` endpoint manually set `req.session.userId` instead of using `req.logIn()`
2. **Inconsistent session creation**: Different methods used for session creation across endpoints

## Solution Implemented

### 1. **Frontend Fixes (UserContext.tsx)**

#### Added OAuth Processing Flag:

```typescript
const isOAuthProcessing = useRef(false); // Track OAuth processing state
```

#### Prevented Initial Fetch During OAuth:

```typescript
// Initial authentication check - only runs if not processing OAuth
useEffect(() => {
  if (!hasInitialized.current && !isOAuthProcessing.current) {
    hasInitialized.current = true;
    fetchUser();
  }
}, []);
```

#### Coordinated OAuth Handling:

```typescript
if (isOAuthSuccess && oauthToken) {
  isOAuthProcessing.current = true; // Set flag before processing
  // ... OAuth processing ...
  isOAuthProcessing.current = false; // Reset flag after completion
}
```

### 2. **Backend Fixes (authRoutes.js)**

#### Improved Session Validation:

```javascript
// Check if session already exists and is valid for the same user
if (
  req.isAuthenticated() &&
  req.user &&
  req.user._id.toString() === user._id.toString()
) {
  console.log("✅ Session already exists and is valid for user:", user.email);
  console.log("Session ID:", req.sessionID);
  return res.json({
    success: true,
    user: user,
    sessionID: req.sessionID,
    message: "Session already validated",
  });
}
```

#### Consistent Session Creation:

```javascript
// Use req.logIn to properly set the session (same as OAuth callback)
req.logIn(user, (err) => {
  if (err) {
    console.error("❌ Session login error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to set session",
    });
  }

  console.log("✅ Session set successfully for user:", user.email);
  console.log("New session ID:", req.sessionID);

  res.json({
    success: true,
    user: user,
    sessionID: req.sessionID,
    message: "Session validated successfully",
  });
});
```

## New OAuth Flow

### Before (Creates 2 Sessions):

1. OAuth Success → Backend creates session ✅
2. Frontend useEffect 1 → `fetchUser()` → Backend creates another session ❌
3. Frontend useEffect 2 → `validateOAuthToken()` → Backend creates third session ❌
4. Frontend fallback → `fetchUser()` → Backend creates fourth session ❌

### After (Creates 1 Session):

1. OAuth Success → Backend creates session ✅
2. Frontend detects OAuth → Sets `isOAuthProcessing = true` ✅
3. Frontend useEffect 1 → Skipped (OAuth processing) ✅
4. Frontend useEffect 2 → `validateOAuthToken()` → Backend checks existing session ✅
5. If session exists → Return user data ✅
6. If session doesn't exist → Create single session with `req.logIn()` ✅

## Key Improvements

### 1. **Race Condition Prevention**

- Added `isOAuthProcessing` flag to prevent multiple simultaneous authentication calls
- Initial `fetchUser()` is skipped when OAuth is being processed

### 2. **Consistent Session Management**

- All session creation now uses `req.logIn()` method
- Removed manual `req.session.userId` setting
- Better session validation before creating new sessions

### 3. **Better Logging**

- Added detailed logging for session IDs and user information
- Clear distinction between existing and new sessions
- Better debugging information for troubleshooting

### 4. **Simplified Flow**

- Removed unnecessary session transfer mechanism
- Single fallback to regular fetch instead of multiple attempts
- Cleaner error handling

## Testing Checklist

### Desktop:

- [ ] OAuth Google login creates only 1 session
- [ ] OAuth GitHub login creates only 1 session
- [ ] User data loads immediately after OAuth
- [ ] Session persists after page refresh
- [ ] No duplicate sessions in database
- [ ] Console shows "Session already exists" when appropriate

### Mobile:

- [ ] OAuth Google login creates only 1 session
- [ ] OAuth GitHub login creates only 1 session
- [ ] User data loads immediately after OAuth
- [ ] Session persists after page refresh
- [ ] No duplicate sessions in database

## Database Verification

To verify no duplicate sessions are created:

```javascript
// Check sessions in MongoDB
db.sessions.find().sort({ _id: -1 }).limit(10);

// Should show only one session per user login
// Session IDs should be consistent across requests
```

## Console Logs to Monitor

### Successful OAuth Flow:

```
🔄 OAuth redirect detected with token, validating...
🔄 Validating OAuth token...
✅ Session already exists and is valid for user: user@example.com
Session ID: abc123...
✅ OAuth token validation successful: {user data}
```

### New Session Creation:

```
🔄 Setting session for user: user@example.com
Current session ID: old123...
Current user in session: none
✅ Session set successfully for user: user@example.com
New session ID: new456...
```

## Troubleshooting

### If still seeing duplicate sessions:

1. Check console for "Session already exists" messages
2. Verify `isOAuthProcessing` flag is working correctly
3. Check if multiple OAuth redirects are happening
4. Ensure UserContext is not making multiple authentication calls

### If OAuth fails:

1. Check console for "OAuth token validation" logs
2. Verify token is not expired (5 minutes)
3. Check backend session configuration
4. Test with browser developer tools

### If session validation fails:

1. Check if session cookie is being sent correctly
2. Verify CORS settings in backend
3. Check if session store is working properly
4. Monitor session IDs in logs

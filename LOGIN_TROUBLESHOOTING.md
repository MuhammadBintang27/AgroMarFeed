# Login Troubleshooting Guide

## Current Status
- ✅ Backend login authentication working (confirmed by logs)
- ✅ Session creation working (confirmed by logs)
- ❌ Frontend not receiving user data after login

## Debug Steps

### 1. Check Frontend Login API Route
- Frontend login route should forward cookies from backend
- Check browser network tab for login request
- Verify Set-Cookie header is received

### 2. Check Cookie Handling
- Verify cookies are being set correctly
- Check if cookies are being sent with subsequent requests
- Verify cookie domain and SameSite settings

### 3. Check UserContext
- Verify UserContext refetch is called after login
- Check if current-user API is called
- Verify user data is set in context

### 4. Check Browser Console
- Look for any JavaScript errors
- Check network requests and responses
- Verify cookie storage

## Common Issues and Solutions

### Issue 1: Cookies Not Being Set
**Symptoms**: Login successful but no session cookie
**Solution**: 
- Check CORS configuration
- Verify cookie domain settings
- Ensure SameSite is set correctly

### Issue 2: Cookies Not Being Sent
**Symptoms**: Login works but current-user returns 401
**Solution**:
- Check withCredentials setting
- Verify cookie forwarding in API routes
- Check browser cookie settings

### Issue 3: UserContext Not Updating
**Symptoms**: Login successful but UI doesn't update
**Solution**:
- Verify refetch is called after login
- Check UserContext error handling
- Ensure proper state updates

## Testing Commands

### Test Backend Login
```bash
curl -X POST https://agromarfeed-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"habilaswad30@gmail.com","password":"password123"}' \
  -c cookies.txt
```

### Test Current User
```bash
curl -X GET https://agromarfeed-backend.vercel.app/api/auth/current-user \
  -b cookies.txt
```

### Test Frontend API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"habilaswad30@gmail.com","password":"password123"}' \
  -c frontend-cookies.txt
```

## Environment Variables Check

### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=https://agromarfeed-backend.vercel.app
```

### Backend (.env)
```
FRONTEND_URL=https://agromarfeed.vercel.app
SESSION_SECRET=your_session_secret
MONGODB_URI=your_mongodb_uri
```

## Next Steps
1. Test login in browser with developer tools open
2. Check network tab for cookie headers
3. Verify UserContext state after login
4. Test current-user API directly
5. Check backend logs for any errors 
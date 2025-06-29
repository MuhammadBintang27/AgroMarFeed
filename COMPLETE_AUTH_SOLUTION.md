# Complete Authentication Solution for AgroMarFeed

## Overview
This document describes the complete authentication solution that enables both email/password and OAuth (Google/GitHub) login to work on both desktop and mobile devices.

## Architecture

### Frontend (Next.js)
- **Base URL Strategy**: Uses empty `baseURL` for regular auth requests to route through Next.js API routes
- **OAuth Initiators**: Use direct backend URLs for OAuth redirects (required for OAuth to work)
- **Session Handling**: Multiple fallback mechanisms for session persistence

### Backend (Express.js)
- **Session Store**: MongoDB with connect-mongo
- **CORS Configuration**: Properly configured for cross-domain requests
- **Cookie Settings**: Secure cookies for production, lax for development

## Key Components

### 1. Hybrid Auth Strategy (`lib/auth.ts`)
```typescript
// Regular auth requests use relative URLs (mobile compatible)
const api: AxiosInstance = axios.create({
  baseURL: '', // Routes through Next.js API routes
  withCredentials: true, 
});

// OAuth initiators use direct backend URLs (required for OAuth)
export const initiateGoogleLogin = (): void => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  window.location.href = `${backendUrl}/api/auth/google`;
};
```

### 2. Token Validation Solution
After OAuth callback, backend generates a temporary base64-encoded token with session info and redirects frontend. Frontend validates this token via API route.

**Backend OAuth Callback:**
```javascript
// Create session token
const sessionToken = Buffer.from(JSON.stringify({
  sessionId: req.sessionID,
  userId: user._id,
  email: user.email,
  timestamp: Date.now()
})).toString('base64');

// Redirect with token
const redirectUrl = `${process.env.FRONTEND_URL}/?oauth=success&token=${sessionToken}`;
res.redirect(redirectUrl);
```

**Frontend Token Validation:**
```typescript
// Validate OAuth token
const validationData = await validateOAuthToken(oauthToken);
if (validationData.success && validationData.user) {
  setUser(validationData.user);
  setError(null);
  return;
}
```

### 3. UserContext with Multiple Fallbacks
```typescript
// OAuth redirect handling with multiple fallbacks
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const isOAuthSuccess = urlParams.get("oauth") === "success";
  const oauthToken = urlParams.get("token");

  if (isOAuthSuccess && oauthToken) {
    // 1. Try token validation
    const validationData = await validateOAuthToken(oauthToken);
    if (validationData.success) return;

    // 2. Fallback to session transfer
    const transferData = await transferOAuthSession();
    if (transferData.success) return;

    // 3. Final fallback to regular fetch
    setTimeout(() => fetchUser(), 2000);
  }
}, []);
```

## API Routes

### Frontend API Routes (Next.js)
- `/api/auth/login` - Forwards login request to backend
- `/api/auth/current-user` - Gets current user from backend
- `/api/auth/validate-oauth-token` - Validates OAuth token from backend
- `/api/auth/oauth-session-transfer` - Transfers OAuth session

### Backend API Routes (Express)
- `/api/auth/login` - Handles email/password authentication
- `/api/auth/google` - Initiates Google OAuth
- `/api/auth/google/callback` - Handles Google OAuth callback
- `/api/auth/validate-oauth-token` - Validates session tokens
- `/api/auth/current-user` - Returns current authenticated user

## Session Configuration

### Backend Session Setup
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60,
    autoRemove: 'native'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined,
  },
  name: 'agromarfeed.sid',
}));
```

### CORS Configuration
```javascript
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'https://agromarfeed.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));
```

## Authentication Flow

### Email/Password Login
1. User submits credentials via frontend form
2. Frontend API route forwards request to backend
3. Backend validates credentials using Passport Local Strategy
4. Backend creates session and returns user data
5. Frontend updates UserContext with user data

### OAuth Login (Google/GitHub)
1. User clicks OAuth button
2. Frontend redirects to backend OAuth endpoint
3. Backend redirects to OAuth provider
4. OAuth provider redirects back to backend callback
5. Backend creates session and generates token
6. Backend redirects to frontend with token
7. Frontend validates token and sets user data

## Error Handling

### Multiple Fallback Mechanisms
1. **Token Validation**: Primary method for OAuth
2. **Session Transfer**: Fallback if token validation fails
3. **Regular Fetch**: Final fallback for all auth methods

### Error Clearing
- Errors are cleared when user is successfully authenticated
- Multiple retry mechanisms for failed requests
- Proper error messages for different failure scenarios

## Mobile Compatibility

### Key Features
- **Empty baseURL**: Routes requests through Next.js API routes for better cookie handling
- **CORS Headers**: Properly configured for cross-domain requests
- **Cookie Settings**: Secure and SameSite settings for mobile browsers
- **Session Persistence**: MongoDB session store for reliable session management

### Mobile-Specific Considerations
- **Delayed Fetching**: Added delays for mobile browsers after OAuth redirect
- **Storage Events**: Listen for login/logout events across tabs
- **Retry Mechanisms**: Multiple attempts to fetch user data

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=https://agromarfeed-backend.vercel.app
```

### Backend (.env)
```
FRONTEND_URL=https://agromarfeed.vercel.app
SESSION_SECRET=your_session_secret
MONGODB_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Testing

### Desktop Testing
- Email/password login should work immediately
- OAuth should redirect and return with user data
- Profile button should show user menu

### Mobile Testing
- All login methods should work on mobile browsers
- Sessions should persist across app restarts
- OAuth redirects should complete successfully

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check session configuration and CORS settings
2. **OAuth Redirect Failures**: Verify callback URLs and environment variables
3. **Mobile Session Issues**: Check cookie settings and domain configuration

### Debug Steps
1. Check browser console for errors
2. Verify backend logs for authentication attempts
3. Test session endpoints directly
4. Check environment variables are set correctly

## Security Considerations

### Session Security
- Secure cookies in production
- HttpOnly cookies to prevent XSS
- Proper SameSite settings
- Session timeout configuration

### OAuth Security
- Validate OAuth tokens on backend
- Check token expiration
- Verify user permissions
- Secure redirect URLs

This solution provides a robust, mobile-compatible authentication system that handles both traditional email/password login and modern OAuth flows while maintaining security and user experience across all devices. 
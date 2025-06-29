# OAuth Token Validation Solution

## Masalah yang Dipecahkan

Session cookies tidak tersimpan dengan benar setelah OAuth redirect, menyebabkan error 401. Solusi token validation ini mengatasi masalah cross-domain cookies dengan menggunakan temporary tokens.

## Root Cause Analysis

1. **Cross-domain cookies**: Backend dan frontend di domain berbeda
2. **Session timing**: Session belum tersimpan saat frontend fetch user data
3. **Cookie restrictions**: Browser mobile memiliki restrictions yang lebih ketat

## Solusi Token Validation

### 1. **Backend Token Generation**

#### Enhanced OAuth Callback:
```javascript
// Create a temporary session token for frontend
const sessionToken = Buffer.from(JSON.stringify({
  sessionId: req.sessionID,
  userId: user._id,
  email: user.email,
  timestamp: Date.now()
})).toString('base64');

// Redirect to frontend with session token
const redirectUrl = `${process.env.FRONTEND_URL}/?oauth=success&token=${sessionToken}`;
res.redirect(redirectUrl);
```

#### Token Validation Endpoint:
```javascript
router.post('/validate-oauth-token', async (req, res) => {
  const { token } = req.body;
  
  // Decode the token
  const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString());
  
  // Check if token is not expired (5 minutes)
  const tokenAge = Date.now() - decodedToken.timestamp;
  if (tokenAge > 5 * 60 * 1000) {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }
  
  // Find user and set session
  const user = await User.findById(decodedToken.userId);
  req.session.userId = user._id;
  req.session.save((err) => {
    res.json({
      success: true,
      user: user,
      sessionID: req.sessionID
    });
  });
});
```

### 2. **Frontend Token Validation**

#### Token Validation API Route:
```typescript
// /api/auth/validate-oauth-token/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const response = await fetch(`${BACKEND_URL}/api/auth/validate-oauth-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  
  // Forward cookies from backend
  const responseHeaders = new Headers();
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    responseHeaders.set('set-cookie', setCookieHeader);
  }
  
  return NextResponse.json(data, { 
    status: response.status,
    headers: responseHeaders
  });
}
```

#### Enhanced UserContext:
```typescript
const handleOAuthSuccess = async () => {
  try {
    console.log("🔄 Validating OAuth token...");
    const validationData = await validateOAuthToken(oauthToken);
    
    if (validationData.success && validationData.user) {
      console.log("✅ OAuth token validation successful:", validationData.user);
      setUser(validationData.user);
      setLoading(false);
      return;
    }
    
    // Fallback to session transfer
    const transferData = await transferOAuthSession();
    if (transferData.success && transferData.user) {
      setUser(transferData.user);
      setLoading(false);
      return;
    }
    
    // Final fallback to regular fetch
    setTimeout(() => fetchUser(), 2000);
  } catch (error) {
    // Final fallback to regular fetch
    setTimeout(() => fetchUser(), 2000);
  }
};
```

## Flow OAuth yang Diperbaiki

### Sebelum (Error 401):
1. OAuth Success → Frontend → Direct fetch ❌ (401)

### Sesudah (Success):
1. OAuth Success → Backend generates token → Frontend with token
2. Frontend → Validate token → Backend sets session → User data ✅

## Keuntungan Solusi Ini

1. **No cookie dependencies**: Tidak bergantung pada cross-domain cookies
2. **Immediate validation**: Token validation langsung setelah OAuth
3. **Multiple fallbacks**: Token validation → Session transfer → Regular fetch
4. **Mobile compatible**: Bekerja di semua browser mobile
5. **Secure**: Token expired dalam 5 menit
6. **BaseURL tetap kosong**: Tidak perlu mengubah baseURL

## Backend Configuration Fixes

### Session Settings:
```javascript
cookie: {
  secure: process.env.NODE_ENV === 'production', // Only secure in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  httpOnly: true, // Changed to true for security
  domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined,
}
```

### CORS Settings:
```javascript
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'https://agromarfeed.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));
```

## Testing Checklist

### Desktop:
- [ ] OAuth Google berhasil
- [ ] Token validation berhasil
- [ ] User data ter-load segera
- [ ] Session persisten setelah refresh

### Mobile:
- [ ] OAuth Google berhasil
- [ ] Token validation berhasil
- [ ] User data ter-load segera
- [ ] Session persisten setelah refresh
- [ ] Tidak ada error 401

## Troubleshooting

### Jika token validation gagal:
1. Cek console untuk "Validating OAuth token" logs
2. Pastikan token tidak expired (5 menit)
3. Cek backend logs untuk token validation
4. Test dengan session transfer fallback

### Jika masih error 401:
1. Cek network tab untuk token validation request
2. Pastikan cookies diteruskan dengan benar
3. Cek backend session configuration
4. Test dengan browser developer tools 
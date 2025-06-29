# Hybrid Auth Solution untuk Mobile & Desktop

## Masalah yang Dipecahkan

Setelah mengubah `baseURL` menjadi kosong (`''`), OAuth Google tidak berfungsi karena OAuth initiators memerlukan URL backend langsung. Solusi hybrid ini memungkinkan:

- ✅ **Login email/password**: Berfungsi di mobile dan desktop
- ✅ **OAuth Google**: Berfungsi di mobile dan desktop
- ✅ **OAuth GitHub**: Berfungsi di mobile dan desktop

## Implementasi Hybrid

### 1. **Regular Auth Requests (baseURL: '')**
```typescript
const api: AxiosInstance = axios.create({
  baseURL: '', // Use relative URLs to hit Next.js API routes (for mobile compatibility)
  withCredentials: true, 
});
```

**Request flow:**
```
Frontend → Next.js API Route → Backend
```

**Keuntungan:**
- Cookies di-handle dengan benar oleh Next.js
- CORS tidak menjadi masalah
- Mobile browser compatibility

### 2. **OAuth Initiators (Direct Backend URLs)**
```typescript
export const initiateGoogleLogin = (): void => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  window.location.href = `${backendUrl}/api/auth/google`;
};
```

**Request flow:**
```
Frontend → Backend (OAuth) → Google → Backend (Callback) → Frontend
```

**Keuntungan:**
- OAuth redirect berfungsi dengan benar
- Session cookies diset oleh backend
- Cross-domain OAuth compatibility

## Flow Lengkap

### Login Email/Password:
1. User input email/password
2. Frontend → `/api/auth/login` (Next.js API route)
3. Next.js API route → Backend
4. Backend validates credentials
5. Backend sets session cookie
6. Next.js forwards cookie to frontend
7. Frontend refetches user data
8. User logged in successfully

### OAuth Google:
1. User clicks "Login with Google"
2. Frontend → `https://backend.com/api/auth/google` (direct)
3. Backend redirects to Google OAuth
4. Google redirects back to `https://backend.com/api/auth/google/callback`
5. Backend processes OAuth callback
6. Backend sets session cookie
7. Backend redirects to `https://frontend.com/?oauth=success`
8. Frontend detects OAuth success
9. Frontend refetches user data via Next.js API route
10. User logged in successfully

## Perbaikan yang Diterapkan

### 1. **Enhanced Error Handling**
```typescript
export const initiateGoogleLogin = (): void => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    console.error('❌ NEXT_PUBLIC_BACKEND_URL not set');
    alert('Backend URL not configured. Please contact administrator.');
    return;
  }
  console.log('🔗 Initiating Google OAuth to:', `${backendUrl}/api/auth/google`);
  window.location.href = `${backendUrl}/api/auth/google`;
};
```

### 2. **Improved Session Debugging**
```typescript
// Extract session cookie specifically
const cookies = request.headers.get('cookie') || '';
const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('agromarfeed.sid='));
console.log('Session cookie found:', sessionCookie ? 'Yes' : 'No');
```

### 3. **Extended OAuth Delay**
```typescript
// Fetch user data after a longer delay for mobile browsers
setTimeout(() => {
  console.log("🔄 Fetching user data after OAuth redirect...");
  fetchUser();
}, 3000); // Increased delay for mobile browsers and OAuth processing
```

### 4. **OAuth Callback Route**
```typescript
// New route: /api/auth/oauth-callback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const oauth = searchParams.get('oauth');
  
  if (oauth === 'success') {
    return NextResponse.redirect(new URL('/?oauth=success', request.url));
  } else {
    return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', request.url));
  }
}
```

## Environment Variables

Pastikan environment variables berikut sudah diset:

```env
# Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=https://agromarfeed-backend.vercel.app
NEXT_PUBLIC_FRONTEND_URL=https://agromarfeed.vercel.app

# Backend (.env)
FRONTEND_URL=https://agromarfeed.vercel.app
BACKEND_URL=https://agromarfeed-backend.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Testing Checklist

### Desktop Testing:
- [ ] Login email/password
- [ ] OAuth Google
- [ ] OAuth GitHub
- [ ] Logout
- [ ] Session persistence

### Mobile Testing:
- [ ] Login email/password
- [ ] OAuth Google
- [ ] OAuth GitHub
- [ ] Session cookies
- [ ] User data loading after OAuth

## Troubleshooting

### Jika OAuth tidak berfungsi:
1. Cek console untuk error messages
2. Pastikan `NEXT_PUBLIC_BACKEND_URL` sudah benar
3. Cek Google OAuth credentials di backend
4. Pastikan redirect URLs sudah benar di Google Console

### Jika session tidak tersimpan:
1. Cek network tab untuk cookie headers
2. Pastikan HTTPS digunakan
3. Cek CORS settings di backend
4. Test dengan delay yang lebih lama

### Jika mobile masih bermasalah:
1. Cek browser developer tools
2. Pastikan cookies tidak di-block
3. Test dengan browser berbeda
4. Cek SameSite cookie settings 
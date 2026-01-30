# Google Authentication Setup Guide for RushCart

## Prerequisites
- Supabase account with your RushCart project
- Google Cloud Console access

## Step 1: Set up Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one for RushCart

### 1.2 Enable Google+ API
1. Navigate to **APIs & Services** > **Library**
2. Search for "Google+ API" 
3. Click **Enable**

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: **RushCart**
   - User support email: Your email
   - Developer contact email: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed
   - Click **Save and Continue**

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **RushCart Web Client**
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     https://mvctnhnzfbolxmmntwew.supabase.co
     ```
   - Authorized redirect URIs:
     ```
     https://mvctnhnzfbolxmmntwew.supabase.co/auth/v1/callback
     http://localhost:5173/auth/callback
     ```
   - Click **Create**

5. Copy your **Client ID** and **Client Secret**

## Step 2: Configure Supabase

### 2.1 Enable Google Provider
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your RushCart project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list
5. Toggle **Enable Sign in with Google**

### 2.2 Add Google Credentials
1. Paste your **Client ID** from Google Cloud Console
2. Paste your **Client Secret** from Google Cloud Console
3. Click **Save**

### 2.3 Configure Redirect URLs
1. Navigate to **Authentication** > **URL Configuration**
2. Add the following to **Redirect URLs**:
   ```
   http://localhost:5173/**
   http://localhost:5173/scan
   ```
3. For production, add your production URL:
   ```
   https://yourdomain.com/**
   https://yourdomain.com/scan
   ```
4. Set **Site URL** to:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`

## Step 3: Update Environment Variables

Your `.env` file has been updated with:
```env
VITE_APP_URL=http://localhost:5173
```

**Important:** When deploying to production, update this to your production URL:
```env
VITE_APP_URL=https://yourdomain.com
```

## Step 4: Test the Implementation

### 4.1 Development Testing
1. Start your development server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   bun dev
   ```

2. Navigate to `http://localhost:5173/auth`
3. Click **Sign in with Google**
4. You should be redirected to Google's consent screen
5. After authorization, you'll be redirected back to `/scan`

### 4.2 Verify Authentication
1. Check if you're logged in by visiting `/profile`
2. User information should be displayed
3. Try logging out and logging back in

## Step 5: Production Deployment

### 5.1 Update Google Cloud Console
1. Add your production domain to **Authorized JavaScript origins**
2. Add your production redirect URI to **Authorized redirect URIs**:
   ```
   https://yourdomain.com/scan
   ```

### 5.2 Update Supabase
1. Add production URLs to **Redirect URLs** in Supabase dashboard
2. Update **Site URL** to your production domain

### 5.3 Update Environment Variables
Create a `.env.production` file:
```env
VITE_SUPABASE_PROJECT_ID=mvctnhnzfbolxmmntwew
VITE_SUPABASE_PUBLISHABLE_KEY=your_key_here
VITE_SUPABASE_URL=https://mvctnhnzfbolxmmntwew.supabase.co
VITE_APP_URL=https://yourdomain.com
```

## Troubleshooting

### Issue: "Redirect URI mismatch"
**Solution:** Ensure the redirect URI in Google Cloud Console exactly matches the one Supabase uses:
```
https://mvctnhnzfbolxmmntwew.supabase.co/auth/v1/callback
```

### Issue: "Access blocked: Authorization Error"
**Solution:** 
1. Go to Google Cloud Console > OAuth consent screen
2. Add your test email address to "Test users"
3. Or publish your app (requires verification for production)

### Issue: User not redirected after Google sign-in
**Solution:**
1. Check that redirect URLs are properly configured in Supabase
2. Verify `VITE_APP_URL` in `.env` matches your current URL
3. Clear browser cache and cookies

### Issue: "The Google Sign-In button doesn't work"
**Solution:**
1. Check browser console for errors
2. Verify Google credentials in Supabase are correct
3. Ensure Google+ API is enabled in Google Cloud Console

## Security Best Practices

1. **Never commit credentials**: Keep `.env` file in `.gitignore`
2. **Use environment variables**: Never hardcode sensitive data
3. **HTTPS in production**: Always use HTTPS for production deployments
4. **Regular key rotation**: Periodically update your OAuth credentials
5. **Monitor usage**: Check Google Cloud Console for unusual activity

## Features Implemented

✅ Google OAuth Sign-In  
✅ Automatic redirect after successful authentication  
✅ Persistent sessions with localStorage  
✅ Auto-refresh tokens  
✅ Protected routes requiring authentication  
✅ Sign out functionality  
✅ Loading states and error handling  

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

## Support

If you encounter any issues, check:
1. Supabase Dashboard > Authentication > Logs
2. Browser Developer Console
3. Network tab for failed requests

---

**Your Google authentication is now properly configured!** 🎉

The implementation includes:
- Secure OAuth 2.0 flow
- Proper error handling
- Auto-redirect for authenticated users
- Persistent sessions
- Production-ready configuration

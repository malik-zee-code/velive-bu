# Token Refresh Implementation Guide

## Overview

The application now includes automatic token refresh functionality. When your access token expires (after 15 minutes), the system will automatically refresh it using the refresh token without requiring you to login again.

## How It Works

### 1. **Proactive Token Refresh**
- The `AuthContext` checks every 60 seconds if the token is about to expire (within 5 minutes)
- If the token is about to expire, it automatically refreshes it in the background
- This ensures seamless user experience without interruptions

### 2. **Reactive Token Refresh**
- If an API call fails with 401 (Unauthorized), the `apiClient` automatically:
  - Attempts to refresh the token using the refresh token
  - Retries the original request with the new token
  - If refresh fails, logs the user out

## Using the API Client

### Import the API Client

```typescript
import { apiClient, get, post, put, del, patch } from '@/lib/apiClient';
```

### Making API Requests

**GET Request:**
```typescript
const data = await get('/api/properties');
```

**POST Request:**
```typescript
const result = await post('/api/users/login', {
  email: 'user@example.com',
  password: 'password'
});
```

**PUT Request:**
```typescript
const updated = await put('/api/properties/123', {
  title: 'Updated Title'
});
```

**DELETE Request:**
```typescript
await del('/api/properties/123');
```

### Skip Authentication

For public endpoints that don't require authentication:

```typescript
const data = await get('/api/public/data', { skipAuth: true });
```

## Manual Token Refresh

If you need to manually refresh the token:

```typescript
import { refreshAccessToken, shouldRefreshToken } from '@/lib/auth';

// Check if token needs refresh
if (shouldRefreshToken()) {
  const success = await refreshAccessToken();
  if (success) {
    console.log('Token refreshed successfully');
  }
}
```

## Benefits

1. **Seamless User Experience**: Users don't need to login again when token expires
2. **Automatic Handling**: No need to manually check token expiration
3. **Secure**: Refresh tokens are stored securely and rotated on each refresh
4. **Queue Management**: Multiple simultaneous requests during token refresh are queued and retried

## Configuration

The token refresh settings can be adjusted in `ui/src/lib/auth.ts`:

- **Refresh Threshold**: Currently set to 5 minutes before expiration
  ```typescript
  return timeUntilExpiry < 300 && timeUntilExpiry > 0;
  ```

- **Check Interval**: Currently checks every 60 seconds in `AuthContext`
  ```typescript
  setInterval(() => { checkAndRefreshToken(); }, 60000);
  ```

## API Endpoint

The refresh token endpoint is available at:
```
POST /api/users/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token-here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

## Migration from Fetch to API Client

If you're using regular `fetch` calls, migrate them to use the API client:

**Before:**
```typescript
const response = await fetch('/api/properties', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

**After:**
```typescript
const data = await get('/api/properties');
```

The API client automatically handles:
- Authentication headers
- Token refresh on 401 errors
- Error handling
- Request queuing during refresh

## Troubleshooting

### Token Keeps Expiring
- Check if the refresh token is being stored correctly in localStorage
- Verify the API endpoint `/api/users/refresh-token` is accessible
- Check browser console for refresh errors

### Infinite Redirect Loop
- Clear localStorage and cookies
- Login again to get fresh tokens

### 401 Errors Still Occurring
- Ensure you're using the `apiClient` instead of raw `fetch`
- Check if the endpoint requires authentication
- Verify refresh token hasn't expired (refresh tokens expire after 7 days)

## Security Notes

1. **Refresh Token Rotation**: Each time you refresh, you get a new refresh token. The old one is revoked.
2. **Secure Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
3. **Automatic Cleanup**: Failed refresh attempts automatically clear tokens and logout
4. **Expiration**: 
   - Access Token: 15 minutes
   - Refresh Token: 7 days



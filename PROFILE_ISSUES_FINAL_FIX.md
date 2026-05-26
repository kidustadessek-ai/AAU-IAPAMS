# Profile Issues - Final Fix

## Issues Identified

### 1. Profile Completeness Stuck at 40%
**Root Cause:** 
- `getUserProfile()` was not receiving the authentication token
- User data was not being properly fetched from backend
- Response structure was not being handled correctly

### 2. Edit Profile Empty After Refresh
**Root Cause:**
- localStorage keys mismatch ('auth' vs 'user' and 'tokens')
- Profile data not being properly saved to localStorage
- AuthContext not updating after profile changes

## Solutions Implemented

### 1. Fixed getUserProfile Token Passing

**File:** `src/pages/staff/Overview.jsx`

```javascript
const fetchData = async () => {
  setIsLoading(true);
  try {
    const token = auth?.tokens?.accessToken;
    const [userRes, appsRes, positionsRes] = await Promise.all([
      getUserProfile(token),  // Now passing token
      getMyApplications(),
      getPositions()
    ]);
    
    console.log('User profile response:', userRes);
    
    if (userRes.success && userRes.data) {
      setUser(userRes.data.data || userRes.data);
    }
    // ... rest of code
  }
};
```

### 2. Fixed localStorage Keys

**File:** `src/components/layout/layout.jsx`

Changed from:
```javascript
const storedAuth = localStorage.getItem('auth');
```

To:
```javascript
const storedUser = localStorage.getItem('user');
```

This matches the authContext which uses separate 'user' and 'tokens' keys.

### 3. Added updateUser to AuthContext

**File:** `src/context/authContext.jsx`

```javascript
const updateUser = (updatedUser) => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const newUser = { ...currentUser, ...updatedUser };
  localStorage.setItem('user', JSON.stringify(newUser));
  setAuth(prev => ({ ...prev, user: newUser }));
};
```

### 4. Added Profile Photo Update Effect

**File:** `src/components/layout/layout.jsx`

```javascript
useEffect(() => {
  if (user?.profilePhoto) {
    setProfilePhoto(user.profilePhoto);
  }
}, [user]);
```

### 5. Enhanced Profile Completeness Calculation

**File:** `src/pages/staff/Overview.jsx`

Added:
- Null check for user
- Detailed logging for debugging
- Better handling of empty values

```javascript
function calculateCompleteness(user) {
  if (!user) return 0;
  
  // ... calculation with logging
  console.log(`Profile completeness: ${filledWeight}/${totalWeight} = ${percentage}%`);
  console.log('User data:', user);
  
  return percentage;
}
```

## How to Test

### Test Profile Completeness

1. **Open Browser Console** (F12)
2. **Login as staff user**
3. **Navigate to staff dashboard**
4. **Check console logs:**
   ```
   User profile response: {...}
   Field fullName is filled, adding weight 1
   Field email is filled, adding weight 1
   ...
   Profile completeness: X/10 = Y%
   User data: {...}
   ```
5. **Verify percentage matches filled fields**

### Test Profile Editing

1. **Click profile icon → Edit Profile**
2. **Go to Education tab**
3. **Add education entry:**
   - Institution: Test University
   - Degree: PhD
   - Field: Computer Science
   - Years: 2015-2020
4. **Click "Add Education"**
5. **Click "Save Changes"**
6. **Wait for success toast**
7. **Wait for page reload (500ms delay)**
8. **Check console logs:**
   ```
   Saving profile with data: {...}
   Updated user in localStorage: {...}
   ```
9. **Click profile icon → Edit Profile again**
10. **Verify education entry is still there**
11. **Check profile completeness increased**

### Test Data Persistence

1. **Add education, experience, and skills**
2. **Save profile**
3. **Navigate to different page**
4. **Come back to dashboard**
5. **Check profile completeness is correct**
6. **Edit profile again**
7. **Verify all data is still there**
8. **Logout and login**
9. **Verify data persists**

## Debugging Guide

### If Profile Completeness is Wrong

1. **Open console and check logs:**
   ```javascript
   // Should see:
   User profile response: { success: true, data: {...} }
   Field fullName is filled, adding weight 1
   ...
   Profile completeness: X/10 = Y%
   ```

2. **Check user data structure:**
   ```javascript
   // In console:
   localStorage.getItem('user')
   // Should show complete user object with education, experience, skills
   ```

3. **Verify token is being passed:**
   ```javascript
   // In console:
   localStorage.getItem('tokens')
   // Should show accessToken and refreshToken
   ```

### If Profile Data is Empty After Refresh

1. **Check localStorage after save:**
   ```javascript
   // In console after saving:
   JSON.parse(localStorage.getItem('user'))
   // Should show updated user with education, experience, skills
   ```

2. **Check network tab:**
   - Look for PATCH /api/v1/auth/me request
   - Check request payload has education, experience, skills
   - Check response has updated data

3. **Check console logs:**
   ```
   Saving profile with data: {...}
   Updated user in localStorage: {...}
   ```

### If Page Doesn't Reload

1. **Check console for errors**
2. **Verify setTimeout is executing:**
   ```javascript
   // Should see page reload after 500ms
   ```

3. **Manually reload page:**
   - Press F5
   - Check if data persists

## Expected Behavior

### Profile Completeness
- **Empty profile:** ~20-30% (has email, username by default)
- **With education:** +20% (weight 2)
- **With experience:** +20% (weight 2)
- **With skills:** +10% (weight 1)
- **With phone:** +10% (weight 1)
- **With photo:** +10% (weight 1)
- **With bio:** +5% (weight 0.5)
- **With department:** +5% (weight 0.5)
- **Complete profile:** 100%

### Profile Editing
- Data saves to MongoDB
- localStorage updates immediately
- Page reloads after 500ms
- All data persists after reload
- All data persists after logout/login
- Profile completeness updates automatically

## Files Modified

1. `src/pages/staff/Overview.jsx` - Fixed token passing and added logging
2. `src/components/layout/layout.jsx` - Fixed localStorage keys and added effect
3. `src/context/authContext.jsx` - Added updateUser function

## Common Issues

### "Profile completeness is 0%"
- User data not loaded
- Check console for errors
- Verify token is valid

### "Profile completeness doesn't change"
- User data not updating
- Check localStorage
- Try logout/login

### "Profile data disappears"
- localStorage not updating
- Check console logs
- Verify save is successful

### "Page doesn't reload"
- JavaScript error
- Check console
- Manually reload

## Next Steps

1. Test with real user data
2. Verify all roles (admin, staff, evaluator)
3. Test on different browsers
4. Test on mobile devices
5. Monitor console for any errors

## Success Criteria

✅ Profile completeness shows correct percentage
✅ Profile completeness updates after changes
✅ Profile data persists after save
✅ Profile data persists after navigation
✅ Profile data persists after logout/login
✅ Edit profile shows saved data
✅ No console errors
✅ Page reloads smoothly after save

# Quick Testing Guide

## How to Test All Fixes

### 1. Profile Completeness (Staff Dashboard)
```
1. Login as staff user
2. Navigate to staff dashboard
3. Check profile completeness percentage
4. Click "Edit Profile"
5. Add education entry → Save → Check percentage increased
6. Add experience entry → Save → Check percentage increased more
7. Add skills → Save → Check percentage increased
8. Fill bio and department → Save → Check small increase
9. Verify percentage is accurate and updates
```

### 2. Application Description Field
```
1. Login as staff user
2. Navigate to "Available Positions"
3. Click "Apply Now" on any open position
4. Upload required CV
5. Type in description field (test character counter)
6. Try typing more than 1000 characters (should be prevented)
7. Submit application
8. Login as admin
9. View applicants for that position
10. Verify description is visible (if implemented in admin view)
```

### 3. Position Applicant Counts
```
1. Login as admin
2. Navigate to "Manage Positions"
3. Note applicant counts on position cards
4. Open new browser/incognito window
5. Login as staff user
6. Apply to a position
7. Go back to admin window
8. Refresh or navigate away and back
9. Verify applicant count increased by 1
10. Test in both grid and list views
```

### 4. Profile Editing - Education
```
1. Login as any user (staff/admin/evaluator)
2. Click profile icon → "Edit Profile"
3. Go to "Education" tab
4. Add new education:
   - Institution: "Test University"
   - Degree: "PhD"
   - Field: "Computer Science"
   - Years: 2015-2020
5. Click "Add Education"
6. Click "Save Changes"
7. Wait for page reload
8. Click profile icon → "Edit Profile"
9. Go to "Education" tab
10. Verify entry is still there
11. Navigate to different page
12. Come back and check again
13. Verify entry persists
```

### 5. Profile Editing - Experience
```
1. Click profile icon → "Edit Profile"
2. Go to "Experience" tab
3. Add new experience:
   - Company: "Test Company"
   - Position: "Senior Developer"
   - Start Date: 2020-01-01
   - Check "I currently work here"
4. Click "Add Experience"
5. Click "Save Changes"
6. Wait for page reload
7. Verify experience persists (same steps as education)
```

### 6. Profile Editing - Skills
```
1. Click profile icon → "Edit Profile"
2. Go to "Skills" tab
3. Add new skill:
   - Name: "React"
   - Level: "Expert"
4. Click "Add Skill"
5. Add another skill:
   - Name: "Node.js"
   - Level: "Advanced"
6. Click "Save Changes"
7. Wait for page reload
8. Verify both skills persist
```

### 7. Profile Photo Upload
```
1. Click profile icon → "Edit Profile"
2. Click on profile photo upload icon
3. Select an image file
4. Verify preview shows
5. Click "Save Changes"
6. Wait for page reload
7. Verify photo appears in header
8. Logout and login again
9. Verify photo still appears
```

### 8. Social Media Links
```
1. Click profile icon → "Edit Profile"
2. Go to "Social & Links" tab
3. Add:
   - LinkedIn: https://linkedin.com/in/test
   - Twitter: https://twitter.com/test
   - GitHub: https://github.com/test
   - Website: https://test.com
4. Click "Save Changes"
5. Wait for page reload
6. Verify links persist
```

## Expected Results

### ✅ Success Indicators
- Toast notification: "Profile updated successfully"
- Page reloads automatically
- All data persists after navigation
- Profile completeness updates correctly
- No console errors
- No network errors

### ❌ Failure Indicators
- Error toast messages
- Data disappears after navigation
- Profile completeness doesn't update
- Console errors
- Network errors (check Network tab)
- Page doesn't reload after save

## Quick Fixes for Common Issues

### Data Not Saving
```bash
# Check backend is running
cd backend
npm start

# Check MongoDB is running
# Windows: Check Services
# Mac/Linux: mongod --version
```

### Profile Completeness Not Updating
```javascript
// Clear localStorage and login again
localStorage.clear();
// Then login
```

### Page Not Reloading
```javascript
// Check browser console for errors
// Verify window.location.reload() is being called
```

## Test Accounts

Create test accounts for each role:
```
Admin:
- username: admin_test
- role: admin

Staff:
- username: staff_test
- role: staff

Evaluator:
- username: evaluator_test
- role: evaluator
```

## Verification Checklist

After each test:
- [ ] Data saved to database (check MongoDB)
- [ ] Data persists after navigation
- [ ] Data persists after logout/login
- [ ] Profile completeness updated
- [ ] No console errors
- [ ] No network errors
- [ ] Toast notifications appear
- [ ] Page reloads after save

## Browser Testing

Test in multiple browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if available)

## Mobile Testing

Test responsive behavior:
- [ ] Mobile view (Chrome DevTools)
- [ ] Tablet view
- [ ] Desktop view

## Performance Testing

- [ ] Profile save completes in < 3 seconds
- [ ] Page reload is smooth
- [ ] No memory leaks (check DevTools Memory)
- [ ] No excessive API calls

## Security Testing

- [ ] Users can only edit their own profiles
- [ ] Admin can edit any profile
- [ ] Role changes require admin permission
- [ ] Password not exposed in responses
- [ ] File uploads validated

## Done! 🎉

If all tests pass, the system is ready for production deployment.

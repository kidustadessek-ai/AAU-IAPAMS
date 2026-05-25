# Quick Usage Guide - New Features

## 🎯 How to Use the New Features

### 1. Pagination

#### Application Management
1. Navigate to **Admin Dashboard** → **Application Management**
2. Scroll to bottom of the table
3. Use **Previous** and **Next** buttons to navigate
4. Current page and total pages displayed in center

#### Positions Page
1. Navigate to **Admin Dashboard** → **Positions**
2. Add more than 5 positions to see pagination
3. Use pagination controls at bottom of list

### 2. Export to CSV

#### Export Applications
1. Go to **Application Management**
2. Apply any filters (optional)
3. Click **Export CSV** button (top right)
4. File downloads as `applications_YYYY-MM-DD.csv`
5. Open in Excel, Google Sheets, or any CSV viewer

#### Export Positions
1. Go to **Positions** page
2. Click **Export CSV** button (top right)
3. File downloads as `positions_YYYY-MM-DD.csv`

**CSV Contents**:
- Applications: Applicant, Email, Position, College, Department, Date, Status
- Positions: Title, Department, Type, Deadline, Status

### 3. Mobile Responsive Design

#### Testing on Mobile
1. Open browser DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select mobile device (iPhone, Samsung, etc.)
4. Navigate through pages

**What's Responsive**:
- Filters wrap to multiple rows
- Buttons stack vertically
- Tables scroll horizontally
- Pagination controls adapt

### 4. Lazy Loading Images

#### Implementation Example
```javascript
import LazyImage from '../components/common/LazyImage';

// In your component
<LazyImage 
  src={user.profilePhoto}
  alt={user.name}
  style={{ width: 100, height: 100, borderRadius: '50%' }}
  placeholder="#f1f5f9"
/>
```

**Where to Use**:
- User profile photos
- Document thumbnails
- Position images
- Dashboard charts/graphs

### 5. Email Templates

#### Testing Emails
1. Ensure `.env` has email configuration:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=AAU IAPAMS <noreply@aau.edu.et>
```

2. Test password reset:
   - Go to login page
   - Click "Forgot Password"
   - Enter email
   - Check inbox for clean, branded email

3. Test welcome email:
   - Admin creates new user
   - New user receives welcome email

---

## 🔧 Developer Tips

### Customizing Pagination
```javascript
// Change items per page
const [limit] = useState(10); // Change to 20, 50, etc.

// Add page size selector
<select onChange={(e) => setLimit(Number(e.target.value))}>
  <option value="10">10</option>
  <option value="25">25</option>
  <option value="50">50</option>
</select>
```

### Customizing CSV Export
```javascript
// Add more columns
const headers = ['Name', 'Email', 'Phone', 'Custom Field'];
const rows = data.map(item => [
  item.name,
  item.email,
  item.phone,
  item.customField
]);

// Change delimiter (use semicolon for Excel in some regions)
const csv = rows.map(row => row.join(';')).join('\n');
```

### Customizing Email Templates
Edit `backend/src/utils/email.js`:
```javascript
// Change brand color
style="background:#YOUR_COLOR"

// Add logo
<img src="YOUR_LOGO_URL" alt="Logo" style="width:150px" />

// Customize text
<p>Your custom message here</p>
```

### Customizing Lazy Loading
```javascript
// Change threshold (when to start loading)
const observer = new IntersectionObserver(
  ([entry]) => { /* ... */ },
  { threshold: 0.5 } // Load when 50% visible
);

// Add loading spinner
{isInView && !isLoaded && <Spinner />}
```

---

## 🐛 Troubleshooting

### Pagination Not Working
- Check if `total` is being set correctly from API
- Verify `page` state updates on button click
- Ensure `limit` matches backend pagination

### CSV Export Issues
- **File won't download**: Check browser popup blocker
- **Wrong data**: Verify `filtered` array has correct data
- **Excel formatting**: Use semicolon delimiter for some regions

### Mobile Layout Broken
- Check `flexWrap: 'wrap'` is applied
- Verify `minWidth` values aren't too large
- Test with actual device, not just DevTools

### Lazy Loading Not Working
- Ensure `IntersectionObserver` is supported (IE11 needs polyfill)
- Check `threshold` value (0.1 = 10% visible)
- Verify image `src` is valid URL

### Emails Not Sending
- Check `.env` email configuration
- Verify Gmail "App Password" (not regular password)
- Check firewall/antivirus blocking port 587
- Review backend logs for errors

---

## 📊 Performance Monitoring

### Check Pagination Performance
```javascript
console.time('pagination');
const paginated = data.slice((page - 1) * limit, page * limit);
console.timeEnd('pagination'); // Should be < 1ms
```

### Check CSV Export Performance
```javascript
console.time('csv-export');
exportToCSV();
console.timeEnd('csv-export'); // Should be < 100ms for 1000 rows
```

### Check Lazy Loading
```javascript
// In browser DevTools Network tab
// Filter by "Img"
// Verify images load only when scrolled into view
```

---

## 🚀 Next Steps

1. **Test all features** in development environment
2. **Review code** for any customizations needed
3. **Update documentation** with your specific use cases
4. **Deploy to staging** for user testing
5. **Collect feedback** and iterate
6. **Deploy to production** when ready

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review `FEATURES_ADDED.md` for technical details
3. Check browser console for errors
4. Review backend logs
5. Create issue with error details

---

**Happy coding! 🎉**

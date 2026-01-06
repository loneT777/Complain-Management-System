# Quick Start Guide - Dashboard

## ⚡ Get Started in 2 Minutes

### Prerequisites
- Laravel backend running
- React frontend installed and dependencies available
- Database with complaint data

---

## Step 1: Verify API Endpoint (Backend)

**File**: `routes/api.php`

✅ Route already added:
```php
Route::get('/dashboard-stats', [ComplaintController::class, 'getDashboardStats']);
```

**Test it:**
```bash
curl http://localhost:8000/api/dashboard-stats
```

---

## Step 2: Verify Component Files (Frontend)

✅ **Component Created**: `react/src/components/Dashboard.jsx`
✅ **Styles Created**: `react/src/components/Dashboard.css`
✅ **View Updated**: `react/src/views/dashboard/DashSales/index.jsx`

---

## Step 3: Start the Application

### Terminal 1 - Start Laravel Server
```bash
cd e:\PMO\CMO\Complain-Management-System
php artisan serve
```
Output should show: `Laravel development server started at http://127.0.0.1:8000`

### Terminal 2 - Start React Development Server
```bash
cd e:\PMO\CMO\Complain-Management-System\react
npm run dev
```
Output should show: `➜  Local:   http://localhost:5173/`

---

## Step 4: Access Dashboard

Navigate to your dashboard page in the application. The dashboard will automatically:
- ✅ Fetch data from the API
- ✅ Display complaint statistics
- ✅ Render interactive pie charts
- ✅ Show status and priority breakdowns

---

## 🎯 What You'll See

### Top Section
- Dashboard title and subtitle
- 4 metric cards showing: Total, Open, Resolved, Closed complaints

### Middle Section
- 2 Interactive Pie Charts:
  - Status Distribution (Open, Assigned, In Progress, Resolved, Closed, Rejected)
  - Priority Distribution (Low, Medium, Urgent, Very Urgent)

### Bottom Section
- 2 Detailed Breakdown Tables with color indicators
- Refresh Data button

---

## 🔧 Configuration

### Change API URL (if different)

**File**: `react/src/components/Dashboard.jsx`

**Find:**
```javascript
const response = await axios.get('http://localhost:8000/api/dashboard-stats');
```

**Replace** with your API URL if needed

---

## ✅ Verification Checklist

- [ ] Laravel server is running on http://localhost:8000
- [ ] React server is running on http://localhost:5173
- [ ] Dashboard page is accessible
- [ ] Complaint data exists in database
- [ ] Charts are rendering
- [ ] Color coding is visible
- [ ] Responsive layout works on mobile

---

## 🐛 If Something Doesn't Work

### Dashboard Not Appearing?
```bash
# Check browser console for errors (F12)
# Check Laravel logs
tail -f storage/logs/laravel.log
```

### Charts Not Rendering?
```bash
# Verify ApexCharts is installed
cd react
npm list react-apexcharts
```

### API Not Responding?
```bash
# Test endpoint directly
curl http://localhost:8000/api/dashboard-stats

# Check Laravel route
php artisan route:list | grep dashboard
```

### No Data Showing?
```bash
# Seed database with test data
php artisan db:seed

# Or migrate fresh with seeding
php artisan migrate:fresh --seed
```

---

## 📱 Test Responsive Design

1. **Desktop**: Open browser normally (≥992px width)
2. **Tablet**: Resize browser to 768px-992px
3. **Mobile**: Resize browser to <768px or test on mobile device

---

## 🎨 Customize Colors

**File**: `react/src/components/Dashboard.jsx` (lines 13-28)

```javascript
const PRIORITY_COLORS = {
  'low': '#4CAF50',        // Change to your preferred color
  'medium': '#FFC107',
  'urgent': '#FF9800',
  'very_urgent': '#F44336'
};

const STATUS_COLORS = {
  'open': '#2196F3',       // Change to your preferred color
  'assigned': '#9C27B0',
  'in_progress': '#FF9800',
  'resolved': '#4CAF50',
  'closed': '#607D8B',
  'rejected': '#F44336'
};
```

---

## 📊 API Response Format

The backend returns data in this format:

```json
{
  "status_stats": [
    {
      "status_id": 1,
      "status_name": "Open",
      "status_code": "open",
      "count": 15
    }
  ],
  "priority_stats": [
    {
      "priority_level": "medium",
      "count": 10
    }
  ],
  "total_complaints": 45,
  "open_complaints": 15,
  "resolved_complaints": 20,
  "closed_complaints": 10,
  "pending_ratio": 33.33
}
```

---

## 🚀 Production Deployment

### Before deploying:

1. **Update API URL** in `Dashboard.jsx` to production URL
2. **Build React App**:
   ```bash
   cd react
   npm run build
   ```
3. **Verify Laravel Routes** are accessible
4. **Test API Endpoint** on production server
5. **Check Database** has sufficient data

---

## 📚 Documentation Files

- **Detailed Guide**: [DASHBOARD_IMPLEMENTATION.md](./DASHBOARD_IMPLEMENTATION.md)
- **Design Guide**: [DASHBOARD_DESIGN_GUIDE.md](./DASHBOARD_DESIGN_GUIDE.md)
- **Setup Guide**: [DASHBOARD_SETUP.md](./DASHBOARD_SETUP.md)

---

## 💡 Tips & Tricks

### Tip 1: Real-time Updates
Click "Refresh Data" button to manually update statistics without page reload

### Tip 2: Debugging
Open browser Developer Tools (F12) and check:
- Network tab for API calls
- Console tab for errors
- Elements tab for CSS rendering

### Tip 3: Performance
Dashboard loads efficiently with:
- Single API call
- Optimized SQL queries
- Efficient React rendering
- GPU-accelerated animations

### Tip 4: Customization
All styling is in `Dashboard.css` - easily modify:
- Colors
- Fonts
- Spacing
- Animations
- Breakpoints

---

## ✨ Features Summary

✅ Real-time complaint statistics
✅ Interactive pie charts with ApexCharts
✅ Professional gradient design
✅ Responsive layout (Mobile, Tablet, Desktop)
✅ Loading and error states
✅ Smooth animations
✅ Color-coded indicators
✅ Detailed breakdown tables
✅ Manual refresh functionality
✅ Clean, minimalist UI

---

## 🎓 Next Steps

1. ✅ Start both servers
2. ✅ Navigate to dashboard
3. ✅ Verify data displays correctly
4. ✅ Test responsive design
5. ✅ Customize colors if desired
6. ✅ Deploy to production

---

**That's it! Your dashboard is ready to use!** 🎉

For detailed information, refer to the implementation documentation files.

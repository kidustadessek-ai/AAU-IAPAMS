# AAU College-Department Structure Implementation

## Overview
Successfully implemented a hierarchical college-department structure for Addis Ababa University (AAU) in the IAPAMS system. This update replaces the flat department list with a comprehensive two-level structure matching AAU's actual organizational hierarchy.

## Changes Made

### 1. Created AAU Structure Data File
**File**: `src/data/aauStructure.js`

- Defined complete college-department mapping for all 14 AAU colleges/institutes
- Includes 100+ departments across all colleges
- Provides utility functions:
  - `getColleges()` - Get all college names
  - `getDepartments(college)` - Get departments for a specific college
  - `getAllDepartments()` - Get flat list of all departments
  - `findCollegeByDepartment(department)` - Find parent college

### 2. Updated Backend Position Model
**File**: `backend/src/models/Position.js`

- Added `college` field (required)
- Kept `department` field (required)
- Updated indexes for better query performance: `college + department`

### 3. Updated Database Seed
**File**: `backend/src/utils/seed.js`

- Updated sample positions to include both college and department
- Examples now use real AAU colleges:
  - Computer Science → College of Natural and Computational Sciences
  - Management → College of Business and Economics
  - Public Health → College of Health Sciences

### 4. Updated Position Management (Admin)
**File**: `src/components/dashboard/admin/PositionManagement.jsx`

- Replaced single department dropdown with two-level selection
- College selection (first) → Department selection (second)
- Department dropdown is disabled until college is selected
- Department options dynamically update based on selected college
- Form validation ensures both college and department are selected

### 5. Updated Available Positions (Staff)
**File**: `src/pages/staff/AvailablePosition.jsx`

- Updated filter to use colleges instead of departments
- Position cards now show:
  - College (as chip badge)
  - Department (as subtitle)
- Position details dialog shows both college and department

### 6. Updated Application Management (Admin)
**File**: `src/pages/admin/application-management/ApplicationManagement.jsx`

- Updated filter dropdown to show colleges
- Added separate columns for College and Department in table
- Applications now display both organizational levels

## AAU Colleges Included

1. **College of Business and Economics** (5 departments)
2. **College of Education and Language Studies** (4 schools)
3. **College of Health Sciences** (4 schools)
4. **College of Humanities, Language Studies, Journalism & Communication** (8 departments)
5. **College of Natural and Computational Sciences** (16 departments/centers)
6. **College of Performing and Visual Arts** (5 departments)
7. **College of Social Sciences, Art and Humanities** (9 departments)
8. **College of Technology and Built Environment** (8 schools/centers)
9. **College of Veterinary Medicine and Agriculture** (10 departments)
10. **Institute for Peace and Security Studies**
11. **Institute of Educational Research**
12. **School of Built Environment** (6 programs)
13. **School of Geography and Development Studies** (7 centers/programs)
14. **School of Law** (3 centers/programs)

## Database Status

✅ Database cleared and reseeded with new structure
✅ 6 users created (1 admin, 2 evaluators, 3 staff)
✅ 3 positions created with college-department structure
✅ 3 sample applications created

## Test Accounts

- **Admin**: `admin` / `Admin@123`
- **Evaluator 1**: `evaluator1` / `Evaluator@123`
- **Evaluator 2**: `evaluator2` / `Evaluator@123`
- **Staff 1**: `staff1` / `Staff@123`
- **Staff 2**: `staff2` / `Staff@123`
- **Staff 3**: `staff3` / `Staff@123`

## How to Use

### Creating a Position (Admin)
1. Click "Post New Job"
2. Fill in position title and description
3. Select **College** from dropdown (e.g., "College of Natural and Computational Sciences")
4. Select **Department** from dropdown (e.g., "Computer Science")
5. Complete remaining fields and publish

### Filtering Positions (Staff)
1. Use the "College" dropdown to filter by college
2. All positions from that college will be displayed
3. Each position card shows both college and department

### Viewing Applications (Admin)
1. Filter by college using the dropdown
2. Table shows both College and Department columns
3. Applications are grouped by college for easier management

## Benefits

1. **Accurate Structure**: Matches AAU's actual organizational hierarchy
2. **Better Organization**: Two-level structure provides clearer categorization
3. **Easier Navigation**: Users can filter by college first, then see specific departments
4. **Scalability**: Easy to add new departments under existing colleges
5. **Data Integrity**: Ensures positions are properly categorized

## Next Steps (Optional Enhancements)

1. Add department-specific requirements templates
2. Implement college-level statistics dashboard
3. Add college dean approval workflow
4. Create department-specific application forms
5. Add college-based email notifications

## Files Modified

### Frontend
- `src/data/aauStructure.js` (NEW)
- `src/components/dashboard/admin/PositionManagement.jsx`
- `src/pages/staff/AvailablePosition.jsx`
- `src/pages/admin/application-management/ApplicationManagement.jsx`

### Backend
- `backend/src/models/Position.js`
- `backend/src/utils/seed.js`

## Verification

To verify the implementation:

1. Start backend: `cd backend && npm start`
2. Start frontend: `npm run dev`
3. Login as admin
4. Create a new position with college-department selection
5. Login as staff and view available positions
6. Verify filtering by college works correctly

---

**Implementation Date**: May 24, 2026
**Status**: ✅ Complete
**Database**: ✅ Seeded with new structure

# AAU Hierarchical College-Department Structure Guide

## Visual Workflow

### 1. Position Creation Flow (Admin)

```
┌─────────────────────────────────────────────────────────────┐
│                    POST NEW POSITION                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: Select College                                    │
│  ┌───────────────────────────────────────────────────┐    │
│  │ College ▼                                         │    │
│  │ ┌─────────────────────────────────────────────┐  │    │
│  │ │ College of Natural and Computational Sci... │  │    │
│  │ │ College of Business and Economics          │  │    │
│  │ │ College of Health Sciences                 │  │    │
│  │ │ College of Education and Language Studies  │  │    │
│  │ │ ...                                        │  │    │
│  │ └─────────────────────────────────────────────┘  │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  Step 2: Select Department (enabled after college)        │
│  ┌───────────────────────────────────────────────────┐    │
│  │ Department ▼                                      │    │
│  │ ┌─────────────────────────────────────────────┐  │    │
│  │ │ Computer Science                           │  │    │
│  │ │ Mathematics                                │  │    │
│  │ │ Physics                                    │  │    │
│  │ │ Chemistry                                  │  │    │
│  │ │ Statistics                                 │  │    │
│  │ │ ...                                        │  │    │
│  │ └─────────────────────────────────────────────┘  │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Position Display (Staff View)

```
┌──────────────────────────────────────────────────────────┐
│  AVAILABLE POSITIONS                                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Filter by College: [All Colleges ▼]                    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ [College Badge]                    [Status]    │    │
│  │                                                 │    │
│  │ Assistant Professor - Computer Science         │    │
│  │ Computer Science                               │    │
│  │                                                 │    │
│  │ We are seeking a qualified Assistant...        │    │
│  │                                                 │    │
│  │ 📅 Deadline: June 23, 2026                     │    │
│  │                                                 │    │
│  │ [Details]                      [Apply Now]     │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3. Application Management (Admin View)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  APPLICATION MANAGEMENT                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Filter: [Status ▼] [College ▼]                                           │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ Applicant    │ Position      │ College        │ Department    │ ...  │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │ John Doe     │ Asst Prof CS  │ [CNCS Badge]   │ [CS Badge]    │ ...  │ │
│  │ Jane Smith   │ Lecturer Mgmt │ [CBE Badge]    │ [Mgmt Badge]  │ ...  │ │
│  │ ...          │ ...           │ ...            │ ...           │ ...  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Example College-Department Mappings

### College of Natural and Computational Sciences
```
College of Natural and Computational Sciences
├── Computer Science
├── Mathematics
├── Physics
├── Chemistry
├── Statistics
├── Information System
├── Computational Science
├── Biotechnology
├── Environmental Science
├── Geology
├── Geophysics, Space Science and Astronomy (IGSSA)
├── Materials Science
├── Food and Nutritional Sciences
├── Earth Sciences
├── Sport Science
└── Africa Center of Excellence for Water Management
```

### College of Business and Economics
```
College of Business and Economics
├── Department of Accounting and Finance
├── Department of Economics
├── Department of Management
├── Department of Public Administration
└── School of Commerce
```

### College of Health Sciences
```
College of Health Sciences
├── School of Medicine
├── School of Nursing and Midwifery
├── School of Pharmacy
└── School of Public Health
```

### College of Technology and Built Environment
```
College of Technology and Built Environment
├── School of Chemical and Bio Engineering
├── School of Civil and Environmental Engineering
├── School of Electrical and Computer Engineering
├── School of Mechanical and Industrial Engineering
├── Center for Biomedical Engineering
├── Center for Energy Technology
├── Center for Materials Engineering
└── Center for Railway Engineering
```

## Data Structure

### Position Object (Backend)
```javascript
{
  _id: "507f1f77bcf86cd799439011",
  title: "Assistant Professor - Computer Science",
  description: "We are seeking...",
  college: "College of Natural and Computational Sciences",  // NEW
  department: "Computer Science",                            // UPDATED
  positionType: "Full-Time",
  requirements: [...],
  deadline: "2026-06-23T00:00:00.000Z",
  status: "open",
  createdBy: "507f1f77bcf86cd799439012",
  evaluators: [...],
  createdAt: "2026-05-24T00:00:00.000Z",
  updatedAt: "2026-05-24T00:00:00.000Z"
}
```

### Form State (Frontend)
```javascript
{
  title: "Assistant Professor - Computer Science",
  description: "We are seeking...",
  college: "College of Natural and Computational Sciences",  // NEW
  department: "Computer Science",                            // UPDATED
  positionType: "Full-Time",
  requirements: [...],
  deadline: "2026-06-23",
  evaluators: [...]
}
```

## API Endpoints (No Changes Required)

All existing endpoints continue to work:
- `POST /api/v1/positions/create` - Now accepts `college` and `department`
- `GET /api/v1/positions` - Returns positions with both fields
- `GET /api/v1/positions/:id` - Returns position details with both fields

## Benefits of Hierarchical Structure

### 1. Better Organization
- Clear parent-child relationship
- Matches AAU's actual structure
- Easier to understand for users

### 2. Improved Filtering
- Filter by college first (broader)
- Then see specific departments
- Reduces cognitive load

### 3. Scalability
- Easy to add new departments
- College structure remains stable
- Can add college-level features later

### 4. Data Integrity
- Ensures valid college-department combinations
- Prevents orphaned departments
- Maintains organizational hierarchy

### 5. Better Reporting
- College-level statistics
- Department-level analytics
- Cross-college comparisons

## Migration Notes

### Existing Data
If you had existing positions without the `college` field, you would need to:
1. Run a migration script to add college field
2. Map each department to its parent college
3. Update all position records

### Current Status
✅ Fresh database with new structure
✅ All seed data includes college field
✅ No migration needed

## Testing Checklist

- [x] Create position with college-department selection
- [x] Department dropdown disabled until college selected
- [x] Department options update when college changes
- [x] Position cards show both college and department
- [x] Filter by college works correctly
- [x] Application table shows both columns
- [x] Database seeded with new structure
- [x] No TypeScript/JavaScript errors
- [x] All API calls work correctly

## Future Enhancements

1. **College-Level Dashboard**
   - Statistics per college
   - Comparison charts
   - Dean's overview

2. **Department-Specific Templates**
   - Pre-filled requirements
   - Standard evaluation criteria
   - Department-specific questions

3. **Approval Workflow**
   - Department head approval
   - College dean approval
   - HR final approval

4. **Advanced Filtering**
   - Multi-select colleges
   - Department search within college
   - Combined filters

5. **Reporting**
   - College-wise application reports
   - Department performance metrics
   - Cross-college analytics

---

**Status**: ✅ Fully Implemented
**Last Updated**: May 24, 2026

# Frontend Component Organization

This document describes the organized structure of the React frontend components.

## Directory Structure

### `/src/components/`

#### `common/` - Reusable UI Components
- **Card/** - Card components (MainCard)
- **Loader/** - Loading indicators (Loader, Progress, Bar, Container, Spinner)
- **Pagination.jsx** - Pagination component

#### `forms/` - Form Components
All form components for data entry and editing:
- AttachmentForm.jsx
- CategoryForm.jsx
- ComplaintForm.jsx
- DivisionForm.jsx
- MessageForm.jsx
- PersonForm.jsx
- RoleForm.jsx

#### `tables/` - Table Components
All table/list display components:
- AttachmentTable.jsx
- CategoryTable.jsx
- ComplaintTable.jsx
- DivisionTable.jsx
- MessageTable.jsx
- PersonTable.jsx
- RoleTable.jsx

#### `complaints/` - Complaint Management Components
All components related to complaint management:
- AddComplaint.jsx - Create new complaints
- EditComplaint.jsx - Edit existing complaints
- Complaint.jsx - View complaint details
- Complaints.jsx - List all complaints
- ComplaintAssignments.jsx - Manage complaint assignments
- AssignComplaintForm.jsx - Form for assigning complaints
- Attachments.jsx - Manage complaint attachments
- MessageThread.jsx - View and manage message threads
- ViewAssignmentDialog.jsx - Dialog for viewing assignment details
- Complaint.css - Styles for complaint components

#### `Widgets/` - Dashboard Widgets
Dashboard and statistics components:
- FeedTable.jsx
- ProductTable.jsx
- **Statistic/** - Statistical display components (FlatCard, ProductCard)

### `/src/views/`

#### `dashboard/` - Dashboard Views
- **DashSales/** - Sales/Statistics dashboard

#### `management/` - Management Pages
Full-page views for managing different entities:
- Categories.jsx - Category management page
- Divisions.jsx - Division management page
- Messages.jsx - Message management page
- Persons.jsx - Person management page
- Roles.jsx - Role management page

### `/src/layouts/`
Layout components:
- **AdminLayout/** - Admin layout with navigation
- **GuestLayout/** - Guest/public layout
- Header.jsx - Header component
- Footer.jsx - Footer component

## Import Path Examples

### Importing Common Components
```jsx
import Pagination from 'components/common/Pagination';
import Loader from 'components/common/Loader/Loader';
import MainCard from 'components/common/Card/MainCard';
```

### Importing Forms
```jsx
import RoleForm from 'components/forms/RoleForm';
import PersonForm from 'components/forms/PersonForm';
```

### Importing Tables
```jsx
import RoleTable from 'components/tables/RoleTable';
import PersonTable from 'components/tables/PersonTable';
```

### Importing Complaint Components
```jsx
import Complaints from 'components/complaints/Complaints';
import Complaint from 'components/complaints/Complaint';
import AddComplaint from 'components/complaints/AddComplaint';
```

### Importing Management Views
```jsx
import Roles from 'views/management/Roles';
import Persons from 'views/management/Persons';
import Categories from 'views/management/Categories';
```

## Benefits of This Structure

1. **Clear Separation of Concerns**: Components are organized by their purpose and reusability
2. **Easy to Locate**: Developers can quickly find components based on their function
3. **Scalability**: Easy to add new components in the appropriate folder
4. **Maintainability**: Related components are grouped together
5. **Reusability**: Common components can be easily shared across the application
6. **Convention Over Configuration**: Follows React best practices for folder structure

## Component Categories

### Views vs Components
- **Views** (`/src/views/`): Full-page components that represent routes
- **Components** (`/src/components/`): Reusable UI pieces that can be composed into views

### Forms vs Tables
- **Forms**: Components for data input and editing
- **Tables**: Components for displaying data in tabular format

### Common vs Feature-Specific
- **Common**: Reusable across the entire application
- **Feature-Specific** (e.g., complaints): Related to a specific feature/domain

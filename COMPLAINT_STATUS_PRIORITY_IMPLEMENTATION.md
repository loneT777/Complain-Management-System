# Complaint Status and Priority Implementation

## Overview
This implementation adds a comprehensive complaint workflow with status tracking and priority levels to the Complaint Management System.

## Features Implemented

### 1. Status Workflow
Complaints follow a workflow with the following statuses:
- **Open** - Initial status when complaint is created (was "Pending")
- **Assigned** - When a complaint is assigned to a division/person
- **In Progress** - When work on the complaint has started
- **Resolved** - When the complaint has been resolved
- **Closed** - When the complaint is formally closed
- **Rejected** - If the complaint is rejected

### 2. Priority Levels
Four priority levels have been added:
- **Low** - Can be handled within normal operations
- **Medium** - Should be handled within reasonable time
- **Urgent** - Requires immediate attention
- **Very Urgent** - Critical issue requiring immediate resolution

### 3. Backend Changes

#### New Models
- `app/Models/Priority.php` - Priority model for managing priority levels

#### New Migration
- `database/migrations/2026_01_02_120000_create_priorities_table.php` - Creates priorities table

#### New Seeder
- `database/seeders/PrioritySeeder.php` - Seeds priority levels into database

#### Updated Files
- `database/seeders/DatabaseSeeder.php` - Added PrioritySeeder to the seeding process
- `app/Http/Controllers/ComplaintController.php` - Added new methods:
  - `updateStatus()` - Update complaint status
  - `updatePriority()` - Update complaint priority
  - `getStatuses()` - Get all available statuses
  - `getPriorities()` - Get all available priorities

#### Updated Routes
- `routes/api.php` - Added new API endpoints:
  - `GET /complaint-statuses` - Get all statuses
  - `GET /complaint-priorities` - Get all priorities
  - `PUT /complaints/{id}/status` - Update status
  - `PUT /complaints/{id}/priority` - Update priority

### 4. Frontend Changes

#### New Components
- `react/src/components/ComplaintStatusPriority.jsx` - React component for displaying and updating status/priority with:
  - Current status display with color-coded badge
  - Current priority display with color-coded badge
  - Dropdown buttons to change status and priority
  - Error/success notifications
  - Automatic logging of changes

#### Updated Components
- `react/src/components/Complaint.jsx`
  - Imported ComplaintStatusPriority component
  - Added ComplaintStatusPriority component to complaint detail view
  - Component displays between complaint info and tabs sections

- `react/src/components/ComplaintTable.jsx`
  - Added Status column showing current complaint status with color-coded badges
  - Added Priority column showing priority level with color-coded badges
  - Updated column widths to accommodate new columns
  - Added proper loading and empty states

## Database Setup

To apply all changes, run:

```bash
# Run migrations
php artisan migrate

# Seed the database
php artisan db:seed

# Or refresh everything
php artisan migrate:fresh --seed
```

## Usage

### Viewing Complaint with Status/Priority Controls
1. Navigate to the complaint detail page
2. Scroll to the "Complaint Status & Priority" section
3. Use the "Change Status" dropdown to update the status
4. Use the "Change Priority" dropdown to update the priority
5. Changes are automatically logged in the complaint logs

### Color Coding
- **Status Badges**: Different colors indicate different statuses
- **Priority Badges**: Different colors indicate different priority levels

### Workflow
When a new complaint is created:
1. Initial status is set to "Open" (pending)
2. When assigned, status changes to "Assigned"
3. During handling, status can be changed to "In Progress"
4. Once resolved, status changes to "Resolved"
5. Finally, it can be "Closed" for archival

## API Documentation

### Get All Statuses
```
GET /api/complaint-statuses
Response: Array of status objects
```

### Get All Priorities
```
GET /api/complaint-priorities
Response: Array of priority objects
```

### Update Status
```
PUT /api/complaints/{id}/status
Body: {
  "status_id": 1,
  "remark": "Optional remark"
}
Response: Updated complaint object
```

### Update Priority
```
PUT /api/complaints/{id}/priority
Body: {
  "priority_level": "Urgent",
  "remark": "Optional remark"
}
Response: Updated complaint object
```

## Change Logging
All status and priority changes are automatically logged in the `complaint_logs` table with:
- Action type (Status Changed / Priority Changed)
- Old and new values
- Optional remarks
- Timestamp

## Notes
- All changes are tracked and logged for audit purposes
- The complaint workflow helps in proper management and follow-up
- Priority levels help in resource allocation and urgency handling
- The system maintains a complete history of all status/priority changes

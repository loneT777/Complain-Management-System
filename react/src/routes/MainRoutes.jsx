import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';

const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
const Complaints = lazy(() => import('../components/complaints/Complaints'));
const Complaint = lazy(() => import('../components/complaints/Complaint'));
const AddComplaint = lazy(() => import('../components/complaints/AddComplaint'));
const EditComplaint = lazy(() => import('../components/complaints/EditComplaint'));
const Persons = lazy(() => import('../views/management/Persons'));
const Divisions = lazy(() => import('../views/management/Divisions'));
const Roles = lazy(() => import('../views/management/Roles'));
const Categories = lazy(() => import('../views/management/Categories'));
const Messages = lazy(() => import('../views/management/Messages'));
const Attachments = lazy(() => import('../components/complaints/Attachments'));
const ComplaintAssignments = lazy(() => import('../components/complaints/ComplaintAssignments'));

const MainRoutes = {
  path: '/',
  children: [
    {
      index: true,
      element: <Navigate to="/dashboard/summary" replace />
    },
    // PROTECTED ADMIN ROUTES
    {
      path: '/',
      element: <AdminLayout />,
      children: [
        {
          path: 'dashboard/summary',
          index: true,
          element: <DashboardSales />
        },
        {
          path: 'dashboard',
          element: <DashboardSales />
        },
        // Complaint-related routes
        { path: 'complaints', element: <Complaints /> },
        { path: 'add-complaint', element: <AddComplaint /> },
        { path: 'complaint/:id', element: <Complaint /> },
        { path: 'edit-complaint/:id', element: <EditComplaint /> },
        { path: 'complaint-assignments', element: <ComplaintAssignments /> },
        
        // Other entity routes
        { path: 'persons', element: <Persons /> },
        { path: 'divisions', element: <Divisions /> },
        { path: 'roles', element: <Roles /> },
        { path: 'categories', element: <Categories /> },
        { path: 'messages', element: <Messages /> },
        { path: 'attachments', element: <Attachments /> },

        // Catch-all for undefined routes
        {
          path: '*',
          element: <h1>Page Not Found</h1>
        }
      ]
    }
  ]
};

export default MainRoutes;
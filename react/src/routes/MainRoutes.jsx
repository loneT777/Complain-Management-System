import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';
import ProtectedRoute from '../components/ProtectedRoute';

const Login = lazy(() => import('../views/auth/login'));
const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
const Complaints = lazy(() => import('../components/Complaints'));
const Complaint = lazy(() => import('../components/Complaint'));
const AddComplaint = lazy(() => import('../components/AddComplaint'));
const EditComplaint = lazy(() => import('../components/EditComplaint'));
const Persons = lazy(() => import('../components/Persons'));
const Divisions = lazy(() => import('../components/Divisions'));
const Roles = lazy(() => import('../components/Roles'));
const Categories = lazy(() => import('../components/Categories'));
const Messages = lazy(() => import('../components/Messages'));
const Attachments = lazy(() => import('../components/Attachments'));
const ComplaintAssignments = lazy(() => import('../components/ComplaintAssignments'));

const MainRoutes = {
  path: '/',
  children: [
    // ROOT REDIRECT
    {
      index: true,
      element: <Navigate to="/dashboard/summary" replace />
    },

    // LOGIN ROUTE (PUBLIC)
    {
      path: 'login',
      element: <Login />
    },

    // PROTECTED ADMIN ROUTES
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      ),
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

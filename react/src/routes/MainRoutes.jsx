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

// Security Management
const Users = lazy(() => import('../views/security/Users'));
const RolesManagement = lazy(() => import('../views/security/RolesManagement'));
const Permissions = lazy(() => import('../views/security/Permissions'));
const RolePermissions = lazy(() => import('../views/security/RolePermissions'));

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
        { 
          path: 'complaints', 
          element: (
            <ProtectedRoute permission="complaint.read">
              <Complaints />
            </ProtectedRoute>
          )
        },
        { 
          path: 'add-complaint', 
          element: (
            <ProtectedRoute permission="complaint.create">
              <AddComplaint />
            </ProtectedRoute>
          )
        },
        { 
          path: 'complaint/:id', 
          element: (
            <ProtectedRoute permission="complaint.read">
              <Complaint />
            </ProtectedRoute>
          )
        },
        { 
          path: 'edit-complaint/:id', 
          element: (
            <ProtectedRoute permission="complaint.update">
              <EditComplaint />
            </ProtectedRoute>
          )
        },
        { 
          path: 'complaint-assignments', 
          element: (
            <ProtectedRoute permission="complaint.assign.view">
              <ComplaintAssignments />
            </ProtectedRoute>
          )
        },

        // Other entity routes
        { 
          path: 'persons', 
          element: (
            <ProtectedRoute permission="setting.read">
              <Persons />
            </ProtectedRoute>
          )
        },
        { 
          path: 'divisions', 
          element: (
            <ProtectedRoute permission="setting.read">
              <Divisions />
            </ProtectedRoute>
          )
        },
        { 
          path: 'roles', 
          element: (
            <ProtectedRoute permission="security.read">
              <Roles />
            </ProtectedRoute>
          )
        },
        { 
          path: 'categories', 
          element: (
            <ProtectedRoute permission="setting.read">
              <Categories />
            </ProtectedRoute>
          )
        },
        { 
          path: 'messages', 
          element: (
            <ProtectedRoute permission="messages">
              <Messages />
            </ProtectedRoute>
          )
        },
        { 
          path: 'attachments', 
          element: (
            <ProtectedRoute permission="attachment">
              <Attachments />
            </ProtectedRoute>
          )
        },

        // Security Management routes
        { 
          path: 'security/users', 
          element: (
            <ProtectedRoute permission="security.read">
              <Users />
            </ProtectedRoute>
          )
        },
        { 
          path: 'security/roles', 
          element: (
            <ProtectedRoute permission="security.read">
              <RolesManagement />
            </ProtectedRoute>
          )
        },
        { 
          path: 'security/permissions', 
          element: (
            <ProtectedRoute permission="security.read">
              <Permissions />
            </ProtectedRoute>
          )
        },
        { 
          path: 'security/role-permissions', 
          element: (
            <ProtectedRoute permission="security.read">
              <RolePermissions />
            </ProtectedRoute>
          )
        },

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

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';

const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
const Persons = lazy(() => import('../components/Persons'));
const Divisions = lazy(() => import('../components/Divisions'));
const Roles = lazy(() => import('../components/Roles'));
const Categories = lazy(() => import('../components/Categories'));
const Complaints = lazy(() => import('../components/Complaints')); // Added Complaints import
const ComplaintAssignments = lazy(() => import('../components/ComplaintAssignments'));


// And in your routes:
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

        { path: 'complaint-assignments', element: <ComplaintAssignments /> },



        { path: 'persons', element: <Persons /> },
        { path: 'divisions', element: <Divisions /> },
        { path: 'roles', element: <Roles /> },
        { path: 'categories', element: <Categories /> },
        { path: 'complaints', element: <Complaints /> }, // Added route for Complaints

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

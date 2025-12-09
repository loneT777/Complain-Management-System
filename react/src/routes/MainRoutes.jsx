import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';

const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
const Complaints = lazy(() => import('../components/Complaints'));
const Complaint = lazy(() => import('../components/Complaint'));
const Persons = lazy(() => import('../components/Persons'));
const Divisions = lazy(() => import('../components/Divisions'));
const Roles = lazy(() => import('../components/Roles'));
const Categories = lazy(() => import('../components/Categories'));

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
        {path: 'complaints', element: <Complaints />},
        {path: 'complaint/:id', element: <Complaint />},
        {path: 'persons', element: <Persons />},
        {path: 'divisions', element: <Divisions />},
        { path: 'roles', element: <Roles /> },
        { path: 'categories', element: <Categories /> },

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

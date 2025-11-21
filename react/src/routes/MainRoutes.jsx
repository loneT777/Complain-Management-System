import { lazy } from 'react';
import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';

const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
const Persons = lazy(() => import('../components/Persons'));
const Divisions = lazy(() => import('../components/Divisions'));
const Roles = lazy(() => import('../components/Roles'));

const Placeholder = () => <h2 style={{ marginTop: '30px' }}></h2>;

// And in your routes:
const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <GuestLayout />,
      children: [
        {
          index: true,
          element: <Placeholder />
        }
      ]
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
        {path: 'persons', element: <Persons />},
        {path: 'divisions', element: <Divisions />},
        { path: 'roles', element: <Roles /> },

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

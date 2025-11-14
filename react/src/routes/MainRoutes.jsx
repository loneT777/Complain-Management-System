import { lazy } from 'react';
import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';
import Designations from 'components/Designations';
import Roles from '../components/Role';
import ExpensesTypes from '../components/ExpensesTypes';
import PaginatedExpensesTypes from '../components/ExpensesTypes';
import PaginatedDesignations from '../components/Designations';


const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
const Login = lazy(() => import('../views/auth/login'));
const Register = lazy(() => import('../views/auth/register'));
const Services = lazy(() => import('../components/Services'));
const Permissions = lazy(() => import('../components/Permissions'));
const Organizations = lazy(() => import('../components/Organization'));
const Employees = lazy(() => import('../components/Employees'));
 const PO_Application = lazy(() => import('../components/PO_Application'));
const Users = lazy(() => import('../components/Users'));
const PM_Application = lazy(() => import('../components/PM_Application'));
const RolePermissions = lazy(() => import('../components/RolePermissions'));
const Parliament_Members = lazy(() => import('../components/Parliament_Members'));

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
          element: <Login />
        },
        {
          path: 'login',
          element: <Login />
        },
        {
          path: 'register',
          element: <Register />
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
          index: true, // This will be the default route after login
          element: <DashboardSales />
        },
        {
          path: 'dashboard',
          element: <DashboardSales />
        },
        {path: 'employees', element: <Employees />},
        {path: 'parliament_members', element: <Parliament_Members />},

        { path: 'applications', element: <Placeholder /> },
        { path: 'applications/po-applications', element: <PO_Application /> },  
        { path: 'applications/po-applications/:statusId', element: <PO_Application /> },
        { path: 'applications/pm-applications', element: <PM_Application /> }, 
        { path: 'applications/pm-applications/:statusId', element: <PM_Application /> },

        { path: 'organizations', element: <Organizations /> },
        
        // Settings routes
        { path: 'settings', element: <Placeholder /> },
        { path: '/settings/services', element: <Services /> },
        { path: 'settings/services', element: <Placeholder /> },
        { path: 'settings/service', element: <Placeholder /> },
        { path: 'settings/service/:id', element: <Placeholder /> },
        { path: 'settings/designations', element: <PaginatedDesignations /> },
        { path: 'settings/designation', element: <Placeholder /> },
        { path: 'settings/designation/:id', element: <Placeholder /> },
        { path: 'settings/expenses-types', element: <PaginatedExpensesTypes /> },
        { path: 'settings/expense-type', element: <Placeholder /> },
        { path: 'settings/expense-type/:id', element: <Placeholder /> },
        
        // Security routes
        { path: 'security', element: <Placeholder /> },
        { path: 'security/users', element: <Users/> },
        { path: 'security/roles', element: <Roles /> },
        { path: 'security/permissions', element: <Permissions /> },
        { path: 'security/role-permissions', element: <RolePermissions /> },
        { path: 'security/admin-logs', element: <Placeholder /> },
        
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
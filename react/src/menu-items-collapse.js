// Menu configuration for collapsed layout
const menuItems = {
  items: [
    {
      id: 'main',
      type: 'group',
      children: [
        { id: 'dashboard', title: 'Dashboard', type: 'item', url: '/dashboard/summary' },
        { id: 'employees', title: 'Employees', type: 'item', url: '/employees' },
        { id: 'parliament-members', title: 'Parliament Members', type: 'item', url: '/parliament_members' },
        { id: 'applications', title: 'Applications', type: 'item', url: '/applications' },
        { id: 'organizations', title: 'Organizations', type: 'item', url: '/organizations' },
        {
          id: 'settings',
          title: 'Settings',
          type: 'collapse',
          children: [
            { id: 'services', title: 'Category', type: 'item', url: '/settings/services' },
            { id: 'designations', title: 'Designations', type: 'item', url: '/settings/designations' }
          ]
        },
        {
          id: 'security',
          title: 'Security',
          type: 'collapse',
          children: [
            { id: 'users', title: 'Users', type: 'item', url: '/security/users' },
            { id: 'roles', title: 'Roles', type: 'item', url: '/security/roles' },
            { id: 'permissions', title: 'Permissions', type: 'item', url: '/security/permissions' },
            { id: 'role-permissions', title: 'Role Permissions', type: 'item', url: '/security/role-permissions' },
            { id: 'admin-logs', title: 'Admin Logs', type: 'item', url: '/security/admin-logs' }
          ]
        }
      ]
    }
  ]
};

export default menuItems;

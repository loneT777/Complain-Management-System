// Menu configuration for collapsed layout
const menuItems = {
  items: [
    {
      id: 'main',
      type: 'group',
      children: [
        { id: 'dashboard', title: 'Dashboard', type: 'item', url: '/dashboard/summary' },
        { 
          id: 'complaints', 
          title: 'Complaints', 
          type: 'collapse',
          children: [
            { id: 'complaints-list', title: 'All Complaints', type: 'item', url: '/complaints' },
            { id: 'add-complaint', title: 'New Complaint', type: 'item', url: '/add-complaint' },
            { id: 'complaint-detail', title: 'Complaint Details', type: 'item', url: '/complaint/1' }
          ]
        },
        { id: 'persons', title: 'Persons', type: 'item', url: '/persons' },
        { id: 'divisions', title: 'Divisions', type: 'item', url: '/divisions' },
        { id: 'categories', title: 'Categories', type: 'item', url: '/categories' },
        { 
          id: 'security', 
          title: 'Security', 
          type: 'collapse',
          children: [
            { id: 'users', title: 'Users', type: 'item', url: '/security/users' },
            { id: 'roles', title: 'Roles', type: 'item', url: '/roles' },
            { id: 'permissions', title: 'Permissions', type: 'item', url: '/security/permissions' },
            { id: 'role-permissions', title: 'Role Permissions', type: 'item', url: '/security/role-permissions' }
          ]
        }
        // { id: 'messages', title: 'Messages', type: 'item', url: '/messages' },
        // { id: 'attachments', title: 'Attachments', type: 'item', url: '/attachments' }
      ]
    }
  ]
};

export default menuItems;
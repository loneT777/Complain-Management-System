// Menu configuration for default layout
const menuItems = {
  items: [
    {
      id: 'main',
      type: 'group',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'home',
          url: '/dashboard/summary'
        },
        {
          id: 'complaints',
          title: 'Complaints',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'description',
          permission: 'complaint.read',
          children: [
            {
              id: 'complaints-list',
              title: 'All Complaints',
              type: 'item',
              url: '/complaints',
              permission: 'complaint.read'
            },
            {
              id: 'add-complaint',
              title: 'New Complaint',
              type: 'item',
              url: '/add-complaint',
              permission: 'complaint.create'
            }
          ]
        },
        // {
        //   id: 'complaint-assignments',
        //   title: 'Complaint Assignments',
        //   type: 'item',
        //   icon: 'material-icons-two-tone',
        //   iconname: 'assignment',
        //   url: '/complaint-assignments',
        //   permission: 'complaint.assign.view'
        // },
        {
          id: 'persons',
          title: 'Persons',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'person',
          url: '/persons',
          permission: 'security.read'
        },
        {
          id: 'divisions',
          title: 'Divisions',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'account_tree',
          url: '/divisions',
          permission: 'security.read'
        },
        {
          id: 'roles',
          title: 'Roles',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'security',
          url: '/roles',
          permission: 'security.read'
        },
        {
          id: 'categories',
          title: 'Categories',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'category',
          url: '/categories',
          permission: 'category.read'
        },
        {
          id: 'security',
          title: 'Security',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'security',
          permission: 'security.read',
          children: [
            {
              id: 'users',
              title: 'Users',
              type: 'item',
              url: '/security/users',
              permission: 'security.read'
            },
            {
              id: 'permissions',
              title: 'Permissions',
              type: 'item',
              url: '/security/permissions',
              permission: 'security.read'
            },
            {
              id: 'role-permissions',
              title: 'Role Permissions',
              type: 'item',
              url: '/security/role-permissions',
              permission: 'security.read'
            }
          ]
        }
      ]
    }
  ]
};

export default menuItems;
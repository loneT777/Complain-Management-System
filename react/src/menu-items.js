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
          children: [
            {
              id: 'complaints-list',
              title: 'All Complaints',
              type: 'item',
              url: '/complaints'
            },
            {
              id: 'add-complaint',
              title: 'New Complaint',
              type: 'item',
              url: '/add-complaint'
            }
          ]
        },
        {
          id: 'persons',
          title: 'Persons',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'person',
          url: '/persons'
        },
        {
          id: 'divisions',
          title: 'Divisions',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'account_tree',
          url: '/divisions'
        },
        {
          id: 'roles',
          title: 'Roles',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'security',
          url: '/roles'
        },
        {
          id: 'categories',
          title: 'Categories',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'category',
          url: '/categories'
        },
        // {
        //   id: 'messages',
        //   title: 'Messages',
        //   type: 'item',
        //   icon: 'material-icons-two-tone',
        //   iconname: 'message',
        //   url: '/messages'
        // },
        // {
        //   id: 'attachments',
        //   title: 'Attachments',
        //   type: 'item',
        //   icon: 'material-icons-two-tone',
        //   iconname: 'attach_file',
        //   url: '/attachments'
        // },
        {
          id: 'complaint-assignments',
          title: 'Complaint Assignments',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'assignment',
          url: '/complaint-assignments'
        },
        {
          id: 'security',
          title: 'Security',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'security',
          children: [
            {
              id: 'users',
              title: 'Users',
              type: 'item',
              url: '/security/users'
            },
            // {
            //   id: 'roles-management',
            //   title: 'Roles',
            //   type: 'item',
            //   url: '/security/roles'
            // },
            {
              id: 'permissions',
              title: 'Permissions',
              type: 'item',
              url: '/security/permissions'
            },
            {
              id: 'role-permissions',
              title: 'Role Permissions',
              type: 'item',
              url: '/security/role-permissions'
            }
          ]
        }
      ]
    }
  ]
};

export default menuItems;
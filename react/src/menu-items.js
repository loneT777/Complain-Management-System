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
          id: 'employees',
          title: 'Public Officers',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'group',
          url: '/employees'
        },
        {
          id: 'parliament_members',
          title: 'Parliament Members',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'group',
          url: '/parliament_members'
        },
        {
          id: 'applications',
          title: 'Applications',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'assignment',
          children: [
            {
              id: 'po-applications',
              title: 'PO Applications',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'list',
              url: '/applications/po-applications'
            },
             {
              id: 'pm-applications',
              title: 'PM Applications',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'list',
              url: '/applications/pm-applications'
            }
          ]
        },
        {
          id: 'organizations',
          title: 'Organizations',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'business',
          url: '/organizations'
        },
        {
          id: 'settings',
          title: 'Settings',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'settings',
          children: [
            {
              id: 'services',
              title: 'Category',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'design_services',
              url: '/settings/services'
            },
            {
              id: 'designations',
              title: 'Designations',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'military_tech',
              url: '/settings/designations'
            },
            {
              id: 'expenses-types',
              title: 'Expenses Types',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'payments',
              url: '/settings/expenses-types'
            }
          ]
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
              icon: 'material-icons-two-tone',
              iconname: 'people',
              url: '/security/users'
            },
            {
              id: 'roles',
              title: 'Roles',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'admin_panel_settings',
              url: '/security/roles'
            },
            {
              id: 'permissions',
              title: 'Permissions',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'vpn_key',
              url: '/security/permissions'
            },
            {
              id: 'role-permissions',
              title: 'Role Permissions',
              type: 'item',
              icon: 'material-icons-two-tone',
              iconname: 'rule',
              url: '/security/role-permissions'
            },
            // {
            //   id: 'admin-logs',
            //   title: 'Admin Logs',
            //   type: 'item',
            //   icon: 'material-icons-two-tone',
            //   iconname: 'history',
            //   url: '/security/admin-logs'
            // }
          ]
        }
      ]
    }
  ]
};

export default menuItems;
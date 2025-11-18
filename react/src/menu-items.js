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
          title: 'Employees',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'group',
          url: '/employees'
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
        }
      ]
    }
  ]
};

export default menuItems;
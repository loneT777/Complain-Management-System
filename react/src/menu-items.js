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
            },
            {
              id: 'complaint-detail',
              title: 'Complaint Details',
              type: 'item',
              url: '/complaint/1'
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
        }
      ]
    }
  ]
};

export default menuItems;
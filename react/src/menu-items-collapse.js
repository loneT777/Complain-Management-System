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
        { id: 'roles', title: 'Roles', type: 'item', url: '/roles' },
        { id: 'categories', title: 'Categories', type: 'item', url: '/categories' }
      ]
    }
  ]
};

export default menuItems;

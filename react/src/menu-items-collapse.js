// Menu configuration for collapsed layout
const menuItems = {
  items: [
    {
      id: 'main',
      type: 'group',
      children: [
        { id: 'dashboard', title: 'Dashboard', type: 'item', url: '/dashboard/summary' },
        { id: 'complaints', title: 'Complaints', type: 'item', url: '/complaints' },
        { id: 'complaint', title: 'Complaint', type: 'item', url: '/complaint/1' },
        { id: 'persons', title: 'Persons', type: 'item', url: '/persons' },
        { id: 'divisions', title: 'Divisions', type: 'item', url: '/divisions' },
        { id: 'roles', title: 'Roles', type: 'item', url: '/roles' },
        { id: 'categories', title: 'Categories', type: 'item', url: '/categories' }
      ]
    }
  ]
};

export default menuItems;

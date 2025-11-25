// Menu configuration for collapsed layout
const menuItems = {
  items: [
    {
      id: 'main',
      type: 'group',
      children: [
        { id: 'dashboard', title: 'Dashboard', type: 'item', url: '/dashboard/summary' },
        { id: 'persons', title: 'Persons', type: 'item', url: '/persons' },
        { id: 'divisions', title: 'Divisions', type: 'item', url: '/divisions' },
        { id: 'roles', title: 'Roles', type: 'item', url: '/roles' },
        { id: 'categories', title: 'Categories', type: 'item', url: '/categories' },
        { id: 'messages', title: 'Messages', type: 'item', url: '/messages' }
      ]
    }
  ]
};

export default menuItems;

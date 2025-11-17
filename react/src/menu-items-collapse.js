// Menu configuration for collapsed layout
const menuItems = {
  items: [
    {
      id: 'main',
      type: 'group',
      children: [
        { id: 'dashboard', title: 'Dashboard', type: 'item', url: '/dashboard/summary' },
        { id: 'employees', title: 'Employees', type: 'item', url: '/employees' },
        { id: 'organizations', title: 'Organizations', type: 'item', url: '/organizations' },
        { id: 'persons', title: 'Persons', type: 'item', url: '/persons' },
        { id: 'divisions', title: 'Divisions', type: 'item', url: '/divisions' }
      ]
    }
  ]
};

export default menuItems;

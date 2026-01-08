import PropTypes from 'prop-types';
// react-bootstrap
import { ListGroup } from 'react-bootstrap';

// project imports
import NavCollapse from '../NavCollapse';
import NavItem from '../NavItem';
import { useAuth } from '../../../../../contexts/AuthContext';

// -----------------------|| NAV GROUP ||-----------------------//

export default function NavGroup({ group, id }) {
  const { user, hasPermission } = useAuth();
  let navItems;

  if (group.children) {
    const groups = group.children;
    navItems = Object.keys(groups).map((item) => {
      item = groups[item];
      
      // Check permission before rendering
      if (item.permission && user?.role?.code !== 'super_admin') {
        if (!hasPermission(item.permission)) {
          return null;
        }
      }
      
      switch (item.type) {
        case 'collapse':
          return <NavCollapse key={`nav-collapse-${item.id}`} collapse={item} type="main" />;
        case 'item':
          return <NavItem key={`nav-item-${item.id}`} item={item} />;
        default:
          return false;
      }
    }).filter(Boolean); // Remove null items
  }

  return (
    <>
      {group.title && (
        <ListGroup.Item as="li" bsPrefix=" " key={group.id} className="pc-item pc-caption" id={id}>
          <label>{group.title}</label>
          <span>{group.subtitle}</span>
        </ListGroup.Item>
      )}
      {navItems}
    </>
  );
}

NavGroup.propTypes = { group: PropTypes.any, id: PropTypes.any };

import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ListGroup, Dropdown, Form } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { useAuth } from '../../../../contexts/AuthContext';
import administrativeOfficerAvatar from 'assets/images/user/administrative-officer.png';
import executiveOfficerAvatar from 'assets/images/user/executive-officer.png';
import privilegeOfficerAvatar from 'assets/images/user/privilege-officer.png';
import subjectOfficerAvatar from 'assets/images/user/subject-officer.png';
import superAdminAvatar from 'assets/images/user/super-admin.jpg';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function NavRight() {
  const navigate = useNavigate();
  const { user: authUser, logout: authLogout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState({
    name: 'User',
    role: 'User'
  });

  // Function to get avatar based on user role
  const getRoleAvatar = (userRole) => {
    const roleAvatars = {
      'Super Admin': superAdminAvatar,
      'Administrative Officer': administrativeOfficerAvatar,
      'Executive Officer': executiveOfficerAvatar,
      'Privilege Officer': privilegeOfficerAvatar,
      'Subject Officer': subjectOfficerAvatar
    };

    // Return role-specific avatar or default to super admin if role not found
    return roleAvatars[userRole] || superAdminAvatar;
  };

  // Get user data from AuthContext or localStorage
  useEffect(() => {
    if (authUser) {
      setUser({
        name: authUser.full_name || 'User',
        role: authUser.role?.name || 'User'
      });
    } else {
      const userData = localStorage.getItem('user');

      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser({
            name: parsedUser.full_name || 'User',
            role: parsedUser.role?.name || 'User'
          });
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }

    // Set axios default headers if token exists
    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [authUser]);

  const handleLogout = async (e) => {
    e.preventDefault();
    setIsLoggingOut(true);

    try {
      // Use AuthContext logout which handles token and API call
      await authLogout();
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ListGroup as="ul" bsPrefix=" " className="list-unstyled">
      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <Dropdown>
          {/* <Dropdown.Toggle as="a" variant="link" className="pc-head-link arrow-none me-0">
            <i className="material-icons-two-tone">search</i>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown drp-search">
            <Form className="px-3">
              <div className="form-group mb-0 d-flex align-items-center">
                <FeatherIcon icon="search" />
                <Form.Control type="search" className="border-0 shadow-none" placeholder="Search here. . ." />
              </div>
            </Form>
          </Dropdown.Menu> */}
        </Dropdown>
      </ListGroup.Item>

      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <div className="d-flex align-items-center">
          <div className="pc-head-link arrow-none me-3 user-name d-flex align-items-center">
            <img src={getRoleAvatar(user.role)} alt="userimage" className="user-avatar" />
            <span>
              <span className="user-name">{user.name}</span>
              <span className="user-desc">{user.role}</span>
            </span>
          </div>

          <Link
            to="#"
            className="btn btn-sm d-flex align-items-center"
            onClick={handleLogout}
            style={{
              pointerEvents: isLoggingOut ? 'none' : 'auto',
              opacity: isLoggingOut ? 0.7 : 1,
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '0.85rem',
              marginRight: '10px',
              border: '1px solid #dc3545',
              color: '#dc3545',
              backgroundColor: 'transparent',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isLoggingOut) {
                e.target.style.backgroundColor = '#dc3545';
                e.target.style.color = 'white';
                e.target.style.borderColor = '#dc3545';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoggingOut) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#dc3545';
                e.target.style.borderColor = '#dc3545';
              }
            }}
          >
            {isLoggingOut ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <em>LOGGING OUT...</em>
              </>
            ) : (
              <>
                <FeatherIcon icon="log-out" size={16} className="me-2" />
                Log Out
              </>
            )}
          </Link>
        </div>
      </ListGroup.Item>
    </ListGroup>
  );
}

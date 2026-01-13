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
import ChangePassword from '../../../../views/auth/ChangePassword';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function NavRight() {
  const navigate = useNavigate();
  const { user: authUser, logout: authLogout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
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
        <Dropdown align="end">
          <Dropdown.Toggle 
            as="div" 
            className="pc-head-link arrow-none me-0" 
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex align-items-center gap-2">
              <img 
                src={getRoleAvatar(user.role)} 
                alt="userimage" 
                className="user-avatar" 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #e0e0e0'
                }}
              />
              <div className="d-flex flex-column">
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#2c3e50',
                  lineHeight: '1.2'
                }}>
                  {user.name}
                </span>
                <span style={{ 
                  fontSize: '12px',
                  color: '#7f8c8d',
                  lineHeight: '1.2'
                }}>
                  {user.role}
                </span>
              </div>
              <FeatherIcon icon="chevron-down" size={16} style={{ color: '#7f8c8d' }} />
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu 
            className="dropdown-menu-end" 
            style={{
              minWidth: '220px',
              padding: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              marginTop: '8px'
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px' }}>
                {user.role}
              </div>
            </div>

            <Dropdown.Item 
              onClick={() => setShowChangePassword(true)}
              className="d-flex align-items-center"
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              <FeatherIcon icon="lock" size={16} className="me-2" style={{ color: '#3a4c4a' }} />
              <span style={{ color: '#2c3e50' }}>Change Password</span>
            </Dropdown.Item>

            <Dropdown.Item 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="d-flex align-items-center"
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              {isLoggingOut ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <span style={{ color: '#e74c3c' }}>Logging Out...</span>
                </>
              ) : (
                <>
                  <FeatherIcon icon="log-out" size={16} className="me-2" style={{ color: '#e74c3c' }} />
                  <span style={{ color: '#e74c3c' }}>Log Out</span>
                </>
              )}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <ChangePassword 
          show={showChangePassword} 
          onHide={() => setShowChangePassword(false)} 
        />
      </ListGroup.Item>
    </ListGroup>
  );
}

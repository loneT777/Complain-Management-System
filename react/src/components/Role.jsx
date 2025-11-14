import { useState, useEffect } from 'react';
import MainCard from 'components/Card/MainCard';
import { Table, Alert, Form } from 'react-bootstrap';
import axios from 'axios';
import Pagination from './Pagination';
const API_URL = import.meta.env.VITE_API_URL;

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Configure axios with auth
  const api = axios.create({
    baseURL: `${API_URL}`,
    headers: { 'Content-Type': 'application/json' }
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Fetch roles from API
  const fetchRoles = (page = 1, search = null) => {
    if (search && search.length < 3) {
      //minimum 3 characters should be there
      return;
    }
    var searchTxt = search ? search : '';
    setLoading(true);
    api.get(`/roles?page=${page}${search ? `&search=${search}` : ""}`)
      .then((res) => {
        // Handle both array response (old) and paginated response (new)
        if (Array.isArray(res.data)) {
          setRoles(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setRoles(res.data.data);
          setTotalPages(res.data.last_page || 1);
          setCurrentPage(res.data.current_page || 1);
        } else {
          setRoles([]);
        }
      })
      .catch((err) => {
        setError('Failed to fetch roles');
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('user');
          localStorage.removeItem('userPermissions');
          window.location.href = "/login";
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoles(currentPage, search);
  }, [currentPage, search]);

  // Format role name for display
  const formatRoleName = (name) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <MainCard title="Roles">
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      
      <div className="mb-4">
        <h5 className="mb-0">Roles</h5>
      </div>
      
      <hr className="mt-4" style={{ opacity: 0.15 }} />

      <div className="mt-4" style={{ 
        borderRadius: '0.3rem', 
        overflow: 'hidden' 
      }}>
        <div className="table-responsive">
          <Table hover className="mb-0" style={{ borderCollapse: 'collapse', borderColor: '#f0f0f0' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <tr>
                <th className="py-3">ID</th>
                <th className="py-3">Name</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="2" className="text-center py-4">Loading...</td></tr>
              ) : roles.length === 0 ? (
                <tr><td colSpan="2" className="text-center py-4">No roles found</td></tr>
              ) : (
                roles.map((role) => (
                  <tr 
                    key={role.id}
                    style={{ borderBottom: '1px solid #f0f0f0' }}
                  >
                    <td className="py-2">{role.id}</td>
                    <td className="py-2">{formatRoleName(role.name)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="mt-4 d-flex justify-content-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </MainCard>
  );
}
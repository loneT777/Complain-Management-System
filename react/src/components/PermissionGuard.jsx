import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const PermissionGuard = ({ children, permission, anyPermissions, allPermissions, fallback = null }) => {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Super admin bypasses all checks
  if (user.role?.code === 'super_admin') {
    return children;
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return fallback || <div className="p-4 text-center text-red-600">You don't have permission to access this content.</div>;
  }

  // Check any of multiple permissions
  if (anyPermissions && !hasAnyPermission(anyPermissions)) {
    return fallback || <div className="p-4 text-center text-red-600">You don't have permission to access this content.</div>;
  }

  // Check all of multiple permissions
  if (allPermissions && !hasAllPermissions(allPermissions)) {
    return fallback || <div className="p-4 text-center text-red-600">You don't have permission to access this content.</div>;
  }

  return children;
};

export default PermissionGuard;

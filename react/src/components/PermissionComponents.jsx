import { useAuth } from '../contexts/AuthContext';

// Component wrapper that shows/hides content based on permissions
export const Can = ({ permission, anyPermissions, allPermissions, children, fallback = null }) => {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  if (!user) return fallback;

  // Super admin can see everything
  if (user.role?.code === 'super_admin') {
    return children;
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  // Check any of multiple permissions
  if (anyPermissions && !hasAnyPermission(anyPermissions)) {
    return fallback;
  }

  // Check all of multiple permissions
  if (allPermissions && !hasAllPermissions(allPermissions)) {
    return fallback;
  }

  return children;
};

// Component wrapper that shows content only if user DOESN'T have permission
export const Cannot = ({ permission, children, fallback = null }) => {
  const { user, hasPermission } = useAuth();

  if (!user) return children;
  
  // Super admin bypasses this
  if (user.role?.code === 'super_admin') {
    return fallback;
  }

  if (hasPermission(permission)) {
    return fallback;
  }

  return children;
};

// Higher-order component for permission checking
export const withPermission = (Component, permission) => {
  return (props) => (
    <Can permission={permission}>
      <Component {...props} />
    </Can>
  );
};

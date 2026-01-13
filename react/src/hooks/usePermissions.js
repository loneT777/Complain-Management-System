import { useAuth } from '../contexts/AuthContext';

export const usePermission = (permissionCode) => {
  const { hasPermission } = useAuth();
  return hasPermission(permissionCode);
};

export const useAnyPermission = (permissionCodes) => {
  const { hasAnyPermission } = useAuth();
  return hasAnyPermission(permissionCodes);
};

export const useAllPermissions = (permissionCodes) => {
  const { hasAllPermissions } = useAuth();
  return hasAllPermissions(permissionCodes);
};

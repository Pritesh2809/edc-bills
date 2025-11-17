import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, allowedRoles }) {
  const { currentUser, userData } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
    // Redirect to appropriate dashboard based on role
    if (userData.role === 'admin') {
      return <Navigate to="/admin" />;
    } else if (userData.role === 'member') {
      return <Navigate to="/member" />;
    } else if (userData.role === 'viewer') {
      return <Navigate to="/viewer" />;
    }
    return <Navigate to="/login" />;
  }

  return children;
}

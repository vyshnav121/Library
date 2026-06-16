import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import ManageBooks from './pages/admin/ManageBooks';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBorrows from './pages/admin/ManageBorrows';
import ManageCategories from './pages/admin/ManageCategories';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'librarian']}>
              <AdminLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<AdminOverview />} />
          <Route path="books" element={<ManageBooks />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="borrows" element={<ManageBorrows />} />
          <Route path="categories" element={<ManageCategories />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

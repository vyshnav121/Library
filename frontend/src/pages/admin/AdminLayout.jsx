import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Sun, Moon, BookOpen, Users, BookMarked, BarChart3, Settings, Clock, Tags } from 'lucide-react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import AIChatbot from '../../components/AIChatbot';
import Footer from '../../components/Footer';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path 
      ? "bg-primary/10 text-primary flex items-center px-4 py-3 text-sm font-semibold rounded-xl" 
      : "text-gray-500 hover:bg-gray-50 flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200";
  };

  const iconClass = (path) => {
    return location.pathname === path 
      ? "mr-3 h-5 w-5 text-primary" 
      : "mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors";
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col hidden md:flex h-full sticky top-0">
        <div className="h-20 flex items-center px-8 border-b border-border cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="bg-primary/10 p-2 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <span className="ml-3 text-lg font-bold text-text tracking-tight">SmartLibrary</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-2 px-4">
            <Link to="/admin" className={isActive('/admin')}>
              <BarChart3 className={iconClass('/admin')} />
              Dashboard
            </Link>
            <Link to="/admin/books" className={isActive('/admin/books')}>
              <BookMarked className={iconClass('/admin/books')} />
              Manage Books
            </Link>
            <Link to="/admin/users" className={isActive('/admin/users')}>
              <Users className={iconClass('/admin/users')} />
              Users
            </Link>
            <Link to="/admin/borrows" className={isActive('/admin/borrows')}>
              <Clock className={iconClass('/admin/borrows')} />
              Borrow Records
            </Link>
            <Link to="/admin/categories" className={isActive('/admin/categories')}>
              <Tags className={iconClass('/admin/categories')} />
              Categories
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <header className="bg-surface border-b border-border h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-20">
          <div className="flex items-center md:hidden cursor-pointer" onClick={() => navigate('/admin')}>
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-text">SmartLibrary</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-6">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="flex items-center space-x-3 border-l border-border pl-6">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-text leading-none">{user?.name}</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider mt-1">
                  {user?.role}
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-primary/20">
                {user?.name?.charAt(0)}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
          <Footer />
        </main>
      </div>
      <AIChatbot />
    </div>
  );
}

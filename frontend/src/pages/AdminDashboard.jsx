import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Sun, Moon, BookOpen, Users, BookMarked, BarChart3, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-gray-200 dark:border-gray-800 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <BookOpen className="h-8 w-8 text-secondary" />
          <span className="ml-2 text-xl font-bold text-text">Admin Panel</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            <Link to="/admin" className="bg-secondary/10 text-secondary flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <BarChart3 className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/admin/books" className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <BookMarked className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Manage Books
            </Link>
            <Link to="/admin/users" className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <Users className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Users
            </Link>
            <Link to="/admin/settings" className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Settings
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-background border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center md:hidden">
            <BookOpen className="h-8 w-8 text-secondary" />
            <span className="ml-2 text-xl font-bold text-text">Admin</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-secondary transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-text">{user?.name}</span>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-secondary/10 text-secondary">
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-red-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-text mb-6">Dashboard Overview</h1>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Stats Cards */}
            <div className="bg-background overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookMarked className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Books</dt>
                      <dd className="text-lg font-medium text-text">120</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-text">45</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Borrows</dt>
                      <dd className="text-lg font-medium text-text">12</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
             <div className="border-4 border-dashed border-gray-200 dark:border-gray-800 rounded-lg h-96 flex flex-col items-center justify-center p-6 text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-text">AI Analytics Coming Soon</h3>
                <p className="mt-1 text-gray-500">Charts and predictive analytics will be displayed here.</p>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}

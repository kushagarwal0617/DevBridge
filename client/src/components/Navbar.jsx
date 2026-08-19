import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

function Navbar({ userName }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 transition-colors">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            D
          </div>
          <span className="font-bold text-gray-900 dark:text-white">DevBridge</span>
        </Link>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <ThemeToggle />
          <Link
            to="/profile"
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition hidden sm:inline"
          >
            {userName}
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 transition font-medium"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;